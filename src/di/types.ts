/**
 * Dependency Injection Symbols
 *
 * Symbol-based identifiers for DI container bindings.
 * These are used for type-safe service resolution via container.get().
 *
 * IMPORTANT: Only shared libraries (Logger, API) define symbols here.
 * App-specific modules (OutboundManager) define their symbols locally in their own types.ts files.
 *
 * Pattern: Each module/feature has its own symbol namespace.
 *
 * Usage:
 * ```typescript
 * // In service constructor
 * @inject(LOGGER_TYPES.Logger) private logger: ILogger
 *
 * // In container
 * bind(LOGGER_TYPES.Logger).to(LoggerService);
 * ```
 */

/**
 * Logger Module Symbols
 */
export const LOGGER_TYPES = {
  Logger: Symbol.for('Logger'),
};

/**
 * API Module Symbols
 */
export const API_TYPES = {
  ApiConf: Symbol.for('ApiConf'),
  ApiFetch: Symbol.for('ApiFetch'),
};
