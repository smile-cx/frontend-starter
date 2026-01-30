/**
 * API Configuration Interface
 *
 * Configuration object for initializing the API HTTP client.
 * Passed to DI modules during container initialization.
 */
export interface IApiConf {
  /**
   * Base URL for all API requests
   *
   * Examples:
   * - Development: 'http://localhost:3001'
   * - Staging: 'https://api-staging.smilecx.com'
   * - Production: 'https://api.smilecx.com'
   *
   * MUST NOT end with trailing slash
   */
  apiUrl: string;

  /**
   * Optional authentication token appended to request query parameters
   *
   * - Public context (pre-auth): undefined
   * - Authenticated context: JWT token or session token
   *
   * Example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
   *
   * When provided, token is appended as ?token=<value> to all requests
   */
  token?: string;
}
