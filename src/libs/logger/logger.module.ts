import { ContainerModule } from 'inversify';
import { LOGGER_TYPES } from '../../di/types';
import { LoggerService } from './logger.service';

/**
 * Logger Module
 *
 * ContainerModule for binding logger services.
 *
 * MANDATORY PATTERN: Services are NEVER bound directly in containers.
 * All services must be registered via ContainerModules.
 *
 * Inversify 7.x Pattern: ContainerModule callback receives an options object.
 * Use destructuring to extract bind, rebind, etc.
 *
 * Usage in container:
 * ```typescript
 * import { loggerModule } from '../libs/logger/logger.module';
 *
 * async init() {
 *   this.load(loggerModule);  // Load module, not direct binding
 * }
 * ```
 */
export const loggerModule = new ContainerModule(({ bind }) => {
  bind(LOGGER_TYPES.Logger).to(LoggerService);
});
