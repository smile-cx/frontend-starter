import { ContainerModule } from 'inversify';
import { OutboundService } from './outbound.service';
import { OUTBOUND_TYPES } from './outbound.types';

/**
 * Outbound Manager Module
 *
 * ContainerModule for binding outbound services.
 *
 * MANDATORY PATTERN: Services are NEVER bound directly in containers.
 * All services must be registered via ContainerModules.
 *
 * This demonstrates app-level module organization:
 * - Apps define their own DI modules
 * - Apps define their own symbol types (OUTBOUND_TYPES)
 * - Apps are self-contained units within src/apps/
 *
 * Usage in container:
 * ```typescript
 * import { outboundModule } from '../apps/outbound-manager/outbound.module';
 *
 * async init() {
 *   this.load(outboundModule);  // Load module after API/Logger
 * }
 * ```
 */
export const outboundModule = new ContainerModule(({ bind }) => {
  bind(OUTBOUND_TYPES.OutboundService).to(OutboundService);
});
