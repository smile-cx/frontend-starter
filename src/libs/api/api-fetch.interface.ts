import { JSONPatch } from 'jsonref';
import { IApiResponse } from './api-response.interface';

/**
 * HTTP Client Interface
 *
 * Provides standardized HTTP methods for API communication.
 * Handles URL composition, authentication, response parsing, and error handling.
 *
 * All methods:
 * - Compose full URL from base + endpoint
 * - Append authentication token if configured
 * - Include credentials for cookie-based sessions
 * - **NEVER throw/reject** - all errors resolve to {ok: false, error}
 *
 * Usage:
 * ```typescript
 * @inject(API_TYPES.ApiFetch) private apiFetch: IApiFetch
 *
 * const response = await this.apiFetch.doGet<User[]>('/users');
 * if (response.ok) {
 *   console.log(response.data); // User[]
 * } else {
 *   console.error(response.error.message);
 * }
 * ```
 */
export interface IApiFetch {
  /**
   * HTTP GET request returning JSON
   *
   * @param endpoint - Relative path (e.g., '/users' or '/users/123')
   * @param options - Optional request options
   * @param options.signal - AbortSignal for manual cancellation
   * @param options.useAbort - Auto-cancel previous request (useful for search/autocomplete)
   * @returns Promise resolving to IApiResponse<T> (never rejects)
   *
   * @example
   * // Basic usage
   * const response = await apiFetch.doGet<User[]>('/users');
   * if (response.ok) {
   *   console.log(response.data); // User[]
   * } else {
   *   console.error(response.error.message);
   * }
   *
   * @example
   * // With pagination
   * const response = await apiFetch.doGet<Tenant[]>('/tenants?limit=20&offset=40');
   * if (response.ok) {
   *   console.log(`Showing ${response.data.length} of ${response.total}`);
   * }
   *
   * @example
   * // With manual abort signal
   * const controller = new AbortController();
   * const response = await apiFetch.doGet('/search?q=...', { signal: controller.signal });
   * // Later: controller.abort();
   *
   * @example
   * // Auto-cancel (search/autocomplete)
   * async function search(term: string) {
   *   const response = await apiFetch.doGet<Result[]>(`/search?q=${term}`, { useAbort: true });
   *   return response.ok ? response.data : [];
   * }
   */
  doGet<T = unknown>(
    endpoint: string,
    options?: { signal?: AbortSignal; useAbort?: boolean }
  ): Promise<IApiResponse<T>>;

  /**
   * HTTP POST request with JSON body
   *
   * @param endpoint - Relative path
   * @param body - Request payload (will be JSON.stringify'd)
   * @param signal - Optional AbortSignal
   * @returns Promise resolving to IApiResponse<T> (never rejects)
   *
   * @example
   * const response = await apiFetch.doPost<User>('/users', {
   *   name: 'John Doe',
   *   email: 'john@example.com'
   * });
   *
   * if (response.ok) {
   *   console.log('Created:', response.data.id);
   *   console.log('Status:', response.status); // 201 Created
   * } else {
   *   console.error('Failed:', response.error.message);
   * }
   */
  doPost<T = unknown>(endpoint: string, body: unknown, signal?: AbortSignal): Promise<IApiResponse<T>>;

  /**
   * HTTP PUT request with JSON body (full resource replacement)
   *
   * @param endpoint - Relative path
   * @param body - Complete resource data (will be JSON.stringify'd)
   * @returns Promise resolving to IApiResponse<T> (never rejects)
   *
   * @example
   * const response = await apiFetch.doPut<User>('/users/123', {
   *   id: 123,
   *   name: 'Jane Doe',
   *   email: 'jane@example.com',
   *   // ... all fields
   * });
   *
   * if (response.ok) {
   *   console.log('Updated:', response.data);
   * } else {
   *   console.error('Failed:', response.error.message);
   * }
   */
  doPut<T = unknown>(endpoint: string, body: unknown): Promise<IApiResponse<T>>;

  /**
   * HTTP DELETE request
   *
   * @param endpoint - Relative path
   * @returns Promise resolving to IApiResponse<T> (never rejects)
   *
   * @example
   * const response = await apiFetch.doDelete('/users/123');
   *
   * if (response.ok && response.status === 204) {
   *   console.log('Deleted successfully');
   * } else if (!response.ok) {
   *   console.error('Failed:', response.error.message);
   * }
   */
  doDelete<T = unknown>(endpoint: string): Promise<IApiResponse<T>>;

  /**
   * HTTP PATCH request with JSON Patch operations (RFC 6902)
   *
   * Use for partial resource updates instead of PUT.
   *
   * @param endpoint - Relative path
   * @param patches - Array of JSON Patch operations
   * @returns Promise resolving to IApiResponse<T> (never rejects)
   *
   * @example
   * // Update single field
   * const response = await apiFetch.doPatch<User>('/users/123', [
   *   { op: 'replace', path: '/email', value: 'new@example.com' }
   * ]);
   *
   * if (response.ok) {
   *   console.log('Updated:', response.data);
   * }
   *
   * @example
   * // Multiple operations
   * const response = await apiFetch.doPatch<User>('/users/123', [
   *   { op: 'replace', path: '/email', value: 'new@example.com' },
   *   { op: 'add', path: '/phoneNumber', value: '+1234567890' },
   *   { op: 'remove', path: '/tempField' }
   * ]);
   *
   * @example
   * // Nested path
   * const response = await apiFetch.doPatch<User>('/users/123', [
   *   { op: 'replace', path: '/address/city', value: 'New York' }
   * ]);
   */
  doPatch<T = unknown>(endpoint: string, patches: JSONPatch): Promise<IApiResponse<T>>;

  /**
   * HTTP POST request with file upload (multipart/form-data)
   *
   * @param endpoint - Relative path
   * @param file - File object to upload
   * @returns Promise resolving to IApiResponse<T> (never rejects)
   *
   * @example
   * const fileInput = document.querySelector('input[type="file"]');
   * const file = fileInput.files[0];
   * const response = await apiFetch.doPostFile<{url: string}>('/upload', file);
   *
   * if (response.ok) {
   *   console.log('Uploaded to:', response.data.url);
   * } else {
   *   console.error('Upload failed:', response.error.message);
   * }
   */
  doPostFile<T = unknown>(endpoint: string, file: File): Promise<IApiResponse<T>>;

  /**
   * HTTP GET request returning plain text (not JSON)
   *
   * Use for HTML, CSV, or other text-based responses.
   *
   * @param endpoint - Relative path
   * @returns Promise resolving to IApiResponse<string> (never rejects)
   *
   * @example
   * const response = await apiFetch.doGetText('/templates/email.html');
   *
   * if (response.ok) {
   *   console.log('HTML:', response.data);
   * } else {
   *   console.error('Failed:', response.error.message);
   * }
   *
   * @example
   * const response = await apiFetch.doGetText('/exports/users.csv');
   * if (response.ok) {
   *   // response.data is CSV string
   * }
   */
  doGetText(endpoint: string): Promise<IApiResponse<string>>;

  /**
   * Get server/client time difference
   *
   * Returns the time difference between server and client clocks in milliseconds.
   * Calculated from the `Date` header of the most recent request.
   *
   * @returns Time difference in milliseconds
   *   - Positive: client clock is ahead of server
   *   - Negative: server clock is ahead of client
   *   - Zero: clocks are synchronized (or no Date header received yet)
   *
   * @example
   * const response = await apiFetch.doGet('/ping');
   * const timeDiff = apiFetch.getServerDateDiff();
   *
   * if (Math.abs(timeDiff) > 1000) {
   *   console.warn('Clock skew detected:', timeDiff, 'ms');
   * }
   *
   * // Adjust timestamp for real-time features
   * const serverTimestamp = Date.now() - timeDiff;
   */
  getServerDateDiff(): number;

  /**
   * Compose full URL from base API URL and endpoint
   *
   * Handles absolute URLs and appends access_token if configured.
   *
   * @param endpoint - Relative path (e.g., '/redirect') or absolute URL
   * @returns Full URL (e.g., 'http://localhost:3001/t/acme-corp/v1/redirect?access_token=xyz')
   *
   * @example
   * // Relative path
   * const url = apiFetch.composePath('/redirect');
   * // Returns: 'http://localhost:3001/t/acme-corp/v1/redirect'
   *
   * @example
   * // Absolute URL (returned as-is)
   * const url = apiFetch.composePath('https://external-api.com/callback');
   * // Returns: 'https://external-api.com/callback'
   *
   * @example
   * // With token configured
   * const url = apiFetch.composePath('/redirect');
   * // Returns: 'http://localhost:3001/t/acme-corp/v1/redirect?access_token=abc123'
   */
  composePath(endpoint: string): string;
}
