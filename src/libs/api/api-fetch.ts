import { inject, injectable } from 'inversify';
import { JSONPatch } from 'jsonref';
import { API_TYPES } from '../../di/types';
import { IApiConf } from './api-conf.interface';
import { IApiFetch } from './api-fetch.interface';
import { IApiResponse } from './api-response.interface';

/**
 * HTTP Client Implementation
 *
 * Concrete implementation of IApiFetch interface providing standardized
 * HTTP methods for API communication with automatic URL composition,
 * authentication token handling, and response parsing.
 *
 * Non-throwing promise pattern: All methods resolve (never reject) to
 * IApiResponse<T> objects with {ok, status?, data?, error?} structure.
 */
@injectable()
export class ApiFetch implements IApiFetch {
  /**
   * Server/client time difference in milliseconds
   * Updated on each request that includes a Date header
   */
  private serverDateDiff = 0;

  /**
   * AbortController for auto-cancellable GET requests
   * Used when doGet() is called with {useAbort: true}
   */
  private controller?: AbortController;

  constructor(@inject(API_TYPES.ApiConf) private config: IApiConf) {}

  /**
   * HTTP GET request returning JSON
   */
  async doGet<T = unknown>(
    endpoint: string,
    options?: { signal?: AbortSignal; useAbort?: boolean }
  ): Promise<IApiResponse<T>> {
    // Handle auto-cancel (search/autocomplete)
    let signal = options?.signal;
    if (options?.useAbort) {
      this.controller?.abort();
      this.controller = new AbortController();
      signal = this.controller.signal;
    }

    try {
      const url = this.composeUrl(endpoint);
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        signal,
      });

      return await this.handleResponse<T>(response, 'json');
    } catch (error: unknown) {
      return this.handleError(error);
    } finally {
      // Cleanup auto-abort controller
      if (options?.useAbort) {
        this.controller = undefined;
      }
    }
  }

  /**
   * HTTP POST request with JSON body
   */
  async doPost<T = unknown>(endpoint: string, body: unknown, signal?: AbortSignal): Promise<IApiResponse<T>> {
    try {
      const url = this.composeUrl(endpoint);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        credentials: 'include',
        signal,
      });

      return await this.handleResponse<T>(response, 'json');
    } catch (error: unknown) {
      return this.handleError(error);
    }
  }

  /**
   * HTTP PUT request with JSON body
   */
  async doPut<T = unknown>(endpoint: string, body: unknown): Promise<IApiResponse<T>> {
    try {
      const url = this.composeUrl(endpoint);
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        credentials: 'include',
      });

      return await this.handleResponse<T>(response, 'json');
    } catch (error: unknown) {
      return this.handleError(error);
    }
  }

  /**
   * HTTP DELETE request
   */
  async doDelete<T = unknown>(endpoint: string): Promise<IApiResponse<T>> {
    try {
      const url = this.composeUrl(endpoint);
      const response = await fetch(url, {
        method: 'DELETE',
        credentials: 'include',
      });

      return await this.handleResponse<T>(response, 'json');
    } catch (error: unknown) {
      return this.handleError(error);
    }
  }

  /**
   * HTTP PATCH request with JSON Patch operations
   */
  async doPatch<T = unknown>(endpoint: string, patches: JSONPatch): Promise<IApiResponse<T>> {
    try {
      const url = this.composeUrl(endpoint);
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json-patch+json',
        },
        body: JSON.stringify(patches),
        credentials: 'include',
      });

      return await this.handleResponse<T>(response, 'json');
    } catch (error: unknown) {
      return this.handleError(error);
    }
  }

  /**
   * HTTP POST request with file upload
   */
  async doPostFile<T = unknown>(endpoint: string, file: File): Promise<IApiResponse<T>> {
    try {
      const url = this.composeUrl(endpoint);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      return await this.handleResponse<T>(response, 'json');
    } catch (error: unknown) {
      return this.handleError(error);
    }
  }

  /**
   * HTTP GET request returning plain text
   */
  async doGetText(endpoint: string): Promise<IApiResponse<string>> {
    try {
      const url = this.composeUrl(endpoint);
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
      });

      return await this.handleResponse<string>(response, 'text');
    } catch (error: unknown) {
      return this.handleError(error);
    }
  }

  /**
   * Compose full URL from base URL and endpoint
   * Ported 1:1 from smart-components ApiFetch.composePath
   *
   * Handles:
   * - Absolute URLs (http://, https://) → returned as-is
   * - Relative paths → concatenated with apiUrl
   * - Token → appended as access_token query param if configured
   */
  composePath(path: string): string {
    const { apiUrl, token } = this.config;

    // Check if path is already absolute (http:// or https://)
    const pattern = /^((http|https):\/\/)/;
    let p: string;

    if (pattern.test(path)) {
      // Use absolute URL as-is
      p = path;
    } else {
      // Concatenate apiUrl + path (legacy doesn't normalize slash)
      p = apiUrl + path;
    }

    // Append access_token if configured (token-based auth)
    if (token) {
      const withToken = new URL(p);
      withToken.searchParams.append('access_token', token);
      return withToken.toString();
    }

    return p;
  }

  /**
   * Compose full URL from base URL, endpoint, and token
   *
   * @private
   */
  private composeUrl(endpoint: string): string {
    const { apiUrl, token } = this.config;

    // Ensure endpoint starts with /
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    // Check if endpoint already has query parameters
    const hasQueryParams = normalizedEndpoint.includes('?');

    // Compose base URL
    let url = `${apiUrl}${normalizedEndpoint}`;

    // Append token if configured
    if (token) {
      const separator = hasQueryParams ? '&' : '?';
      url += `${separator}token=${token}`;
    }

    return url;
  }

  /**
   * Parse pagination and metadata headers from response
   *
   * Extracts:
   * - Results-Matching → total
   * - Results-Skipped → skipped
   * - Link → link
   * - Date → serverDateDiff (also updates instance property)
   *
   * Malformed header values are gracefully skipped (not included in result).
   *
   * @private
   */
  private parseHeaders(response: Response): Partial<IApiResponse<unknown>> {
    const headers: Partial<IApiResponse<unknown>> = {};

    // Parse Results-Matching (total count)
    const resultsMatching = response.headers.get('Results-Matching');
    if (resultsMatching) {
      const value = parseInt(resultsMatching, 10);
      if (!isNaN(value) && value >= 0) {
        headers.total = value;
      }
    }

    // Parse Results-Skipped (pagination offset)
    const resultsSkipped = response.headers.get('Results-Skipped');
    if (resultsSkipped) {
      const value = parseInt(resultsSkipped, 10);
      if (!isNaN(value) && value >= 0) {
        headers.skipped = value;
      }
    }

    // Parse Link header (next page URL)
    const linkHeader = response.headers.get('Link');
    if (linkHeader) {
      headers.link = linkHeader;
    }

    // Parse Date header (server time sync)
    const dateHeader = response.headers.get('Date');
    if (dateHeader) {
      try {
        const serverDate = new Date(dateHeader);
        const now = new Date();
        const diff = now.getTime() - serverDate.getTime();

        // Only set if valid number (not NaN)
        if (!isNaN(diff)) {
          this.serverDateDiff = diff;
          headers.serverDateDiff = this.serverDateDiff;
        }
      } catch {
        // Malformed Date header - skip it
      }
    }

    return headers;
  }

  /**
   * Get server/client time difference
   *
   * Returns the time difference calculated from the most recent request's Date header.
   */
  getServerDateDiff(): number {
    return this.serverDateDiff;
  }

  /**
   * Handle HTTP response (centralized response parsing)
   *
   * Extracts headers, handles error status codes, parses response body,
   * and returns IApiResponse<T> in non-throwing pattern.
   *
   * @private
   */
  private async handleResponse<T>(response: Response, type: 'json' | 'text'): Promise<IApiResponse<T>> {
    const headers = this.parseHeaders(response);

    // Handle 204 No Content
    if (response.status === 204) {
      return {
        ok: true,
        status: 204,
        ...headers,
      } as IApiResponse<T>;
    }

    // Parse response body (for both success and error responses)
    try {
      const parsedData: unknown = type === 'json' ? await response.json() : await response.text();

      // Handle HTTP error status (4xx, 5xx) - but include parsed body as `data`
      if (!response.ok) {
        return {
          ok: false,
          status: response.status,
          data: parsedData as T | undefined, // Include parsed body for error responses (e.g., HTTP 430 MFA data)
          error: {
            message: `Request failed: ${response.status} ${response.statusText}`,
            status: response.status,
            statusText: response.statusText,
          },
          ...headers,
        } as IApiResponse<T>;
      }

      // Success response
      return {
        ok: true,
        status: response.status,
        data: parsedData as T | undefined,
        ...headers,
      } as IApiResponse<T>;
    } catch (_parseError) {
      return {
        ok: false,
        status: response.status,
        error: {
          message: `Failed to parse ${type === 'json' ? 'JSON' : 'text'} response`,
        },
        ...headers,
      } as IApiResponse<T>;
    }
  }

  /**
   * Handle network and abort errors (centralized error handling)
   *
   * Detects AbortError and network failures, returns IApiResponse
   * in non-throwing pattern.
   *
   * @private
   */
  private handleError<T>(error: unknown): IApiResponse<T> {
    // Check if request was aborted
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        ok: false,
        error: {
          message: 'Request aborted',
        },
      };
    }

    // Generic network error
    return {
      ok: false,
      error: {
        message: error instanceof Error ? error.message : 'Network request failed',
      },
    };
  }
}
