import { StarterContainer } from './starter-container';

/**
 * Singleton Container Instance
 *
 * Single container instance used throughout the application.
 * Import this in components and services to access DI services.
 *
 * Pattern: Export pre-instantiated container for easy access.
 *
 * Usage:
 * ```typescript
 * import { starter } from '../../di/containers';
 *
 * // Initialize in scx-root
 * await starter.init({ apiBaseUrl: '...' });
 *
 * // Access services in components
 * const service = starter.outbound;
 * ```
 */
export const starter = new StarterContainer();
