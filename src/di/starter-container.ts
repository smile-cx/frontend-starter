import { Container } from 'inversify';
import type { IOutboundService } from '../apps/outbound-manager/outbound.interface';
import { outboundModule } from '../apps/outbound-manager/outbound.module';
import { OUTBOUND_TYPES } from '../apps/outbound-manager/outbound.types';
import { createApiModule } from '../libs/api/api.module';
import { loggerModule } from '../libs/logger/logger.module';

/**
 * Starter Container
 *
 * Simplified DI container demonstrating module-based initialization.
 * Loads modules sequentially: Logger → API → Outbound.
 *
 * Key patterns demonstrated:
 * - Sequential module loading (dependencies first)
 * - Factory modules with runtime config (API module)
 * - Convenience getters for type-safe service access
 * - Singleton pattern (one container per app)
 *
 * Lifecycle:
 * 1. Create container instance (imported via singleton)
 * 2. Call init() with runtime config (API base URL)
 * 3. Access services via convenience getters
 *
 * Usage:
 * ```typescript
 * import { starter } from './di/containers';
 *
 * // In scx-root componentWillLoad()
 * await starter.init({ apiBaseUrl: 'http://localhost:3001/t/acme-corp/v1' });
 *
 * // In app components
 * const service = starter.outbound;
 * service.campaigns$.subscribe(...);
 * ```
 */
export class StarterContainer extends Container {
  private initialized = false;

  /**
   * Initialize container with runtime configuration
   *
   * Loads modules in dependency order:
   * 1. Logger - no dependencies
   * 2. API - depends on Logger for debug output
   * 3. Outbound - depends on Logger + API
   *
   * @param options - Runtime configuration
   * @param options.apiBaseUrl - Base URL for API requests (e.g., 'http://localhost:3001/t/acme-corp/v1')
   * @returns Promise that resolves when initialization completes
   *
   * @example
   * await starter.init({ apiBaseUrl: 'http://localhost:3001/t/acme-corp/v1' });
   */
  async init(options: { apiBaseUrl: string }): Promise<void> {
    if (this.initialized) {
      console.warn('StarterContainer already initialized');
      return;
    }

    console.log('StarterContainer initializing...');

    // 1. Load Logger module (no dependencies)
    this.load(loggerModule);
    console.log('Logger module loaded');

    // 2. Load API module with configuration
    const apiModule = createApiModule({ apiUrl: options.apiBaseUrl });
    this.load(apiModule);
    console.log('API module loaded');

    // 3. Load Outbound module (depends on Logger + API)
    this.load(outboundModule);
    console.log('Outbound module loaded');

    this.initialized = true;
    console.log('StarterContainer initialized');
  }

  /**
   * Get Outbound service instance
   *
   * Convenience getter for type-safe service access.
   * Preferred over direct container.get() calls.
   *
   * @returns IOutboundService instance
   *
   * @example
   * const service = starter.outbound;
   * service.loadCampaigns();
   * service.campaigns$.subscribe(campaigns => {
   *   console.log('Campaigns:', campaigns);
   * });
   */
  get outbound(): IOutboundService {
    return this.get<IOutboundService>(OUTBOUND_TYPES.OutboundService);
  }
}
