/**
 * API Response Interface
 *
 * Non-throwing promise pattern: All API methods resolve (never reject) to this structure.
 * Use the `ok` field to discriminate between success and failure responses.
 *
 * @template T - The expected data type for successful responses
 *
 * @example
 * // Success case
 * const response = await apiFetch.doGet<User[]>('/users');
 * if (response.ok) {
 *   console.log(response.data); // User[]
 *   console.log(response.status); // 200
 * }
 *
 * @example
 * // Error case (HTTP error)
 * const response = await apiFetch.doGet<User>('/users/999');
 * if (!response.ok) {
 *   console.error(response.error.message); // "Request failed: 404 Not Found"
 *   console.log(response.status); // 404
 * }
 *
 * @example
 * // Network error (no status)
 * const response = await apiFetch.doGet<User[]>('/users');
 * if (!response.ok && !response.status) {
 *   console.error('Network error:', response.error.message);
 * }
 */
export interface IApiResponse<T> {
  /**
   * Discriminator field for success/failure
   * - `true`: Request succeeded (2xx status), data is available
   * - `false`: Request failed (HTTP error, network error, parse error, or abort)
   */
  ok: boolean;

  /**
   * HTTP status code (200, 404, 500, etc.)
   * - Present for successful requests and HTTP errors
   * - Absent for network errors, parse errors, and aborted requests
   */
  status?: number;

  /**
   * Parsed response body (only present when `ok: true`)
   * - For JSON responses: parsed object/array
   * - For text responses (doGetText): string
   * - Absent when `ok: false` or for 204 No Content responses
   */
  data?: T;

  /**
   * Error details (only present when `ok: false`)
   * - HTTP errors: includes status, statusText
   * - Network errors: message only
   * - Parse errors: message only
   * - Abort errors: message only
   */
  error?: IApiError;

  /**
   * Total items matching query (pagination)
   * - Extracted from `Results-Matching` header
   * - Only present when backend includes this header
   * - Safe parsing: malformed values are skipped
   */
  total?: number;

  /**
   * Number of items skipped (pagination offset)
   * - Extracted from `Results-Skipped` header
   * - Only present when backend includes this header
   * - Safe parsing: malformed values are skipped
   */
  skipped?: number;

  /**
   * Next page URL (pagination)
   * - Extracted from `Link` header (RFC 5988 format)
   * - Only present when backend includes this header
   * - Typically includes `rel="next"` for next page
   *
   * @example
   * // Link header: <http://api.example.com/users?page=2>; rel="next"
   * if (response.link) {
   *   console.log('Next page available');
   * }
   */
  link?: string;

  /**
   * Server/client time difference in milliseconds
   * - Calculated from `Date` header: clientTime - serverTime
   * - Positive: client clock ahead of server
   * - Negative: server clock ahead of client
   * - Only present when backend includes `Date` header
   *
   * @example
   * if (response.serverDateDiff && Math.abs(response.serverDateDiff) > 1000) {
   *   console.warn('Clock skew detected:', response.serverDateDiff, 'ms');
   * }
   */
  serverDateDiff?: number;
}

/**
 * API Error Structure
 *
 * Provides detailed error information for failed requests.
 * Error type can be determined by which fields are present.
 */
export interface IApiError {
  /**
   * Human-readable error message (always present)
   *
   * Format varies by error type:
   * - HTTP errors: "Request failed: {status} {statusText}"
   * - Network errors: "Network request failed"
   * - Parse errors: "Failed to parse JSON response"
   * - Abort errors: "Request aborted"
   */
  message: string;

  /**
   * HTTP status code (only for HTTP errors)
   * - 4xx: Client errors (400, 401, 403, 404, etc.)
   * - 5xx: Server errors (500, 503, etc.)
   * - Absent for network, parse, and abort errors
   */
  status?: number;

  /**
   * HTTP status text (only for HTTP errors)
   * - Examples: "Not Found", "Internal Server Error", "Bad Request"
   * - Absent for network, parse, and abort errors
   */
  statusText?: string;
}
