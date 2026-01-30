import type { Logger } from 'debuggo';
import { getLogger } from 'debuggo';
import { injectable } from 'inversify';
import type { ILogger } from './logger.interface';
import { StarterDebugNamespaces } from './logger.interface';

/**
 * Logger Service Implementation
 *
 * Wraps debuggo library to provide consistent logging across the application.
 * All logs are prefixed with 'smilecx-' for easy filtering.
 *
 * @injectable Marks this class for DI injection
 */
@injectable()
export class LoggerService implements ILogger {
  /**
   * Get a logger instance for the specified namespace.
   *
   * The logger will be prefixed with 'smilecx-{namespace}'.
   * Example: getLogger(StarterDebugNamespaces.Api) → 'smilecx-api'
   *
   * @param namespace - The debug namespace to use
   * @returns Logger instance with methods: debug(), log(), warn(), error()
   */
  getLogger(namespace: StarterDebugNamespaces): Logger {
    return getLogger(`smilecx-${namespace}`, 'smilecx');
  }
}
