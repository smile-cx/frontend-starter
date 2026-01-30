import { ContainerModule } from 'inversify';
import { API_TYPES } from '../../di/types';
import type { IApiConf } from './api-conf.interface';
import { ApiFetch } from './api-fetch';

/**
 * API Module Factory
 *
 * Creates a ContainerModule for API services with configuration.
 *
 * MANDATORY PATTERN: Services are NEVER bound directly in containers.
 * All services must be registered via ContainerModules.
 *
 * @param config - API configuration (base URL, optional token)
 * @returns ContainerModule ready to load into a container
 *
 * Usage in container:
 * ```typescript
 * import { createApiModule } from '../libs/api/api.module';
 *
 * async init(options: { apiBaseUrl: string }) {
 *   const apiModule = createApiModule({ apiUrl: options.apiBaseUrl });
 *   this.load(apiModule);
 * }
 * ```
 */
export function createApiModule(config: IApiConf): ContainerModule {
  return new ContainerModule(({ bind }) => {
    bind<IApiConf>(API_TYPES.ApiConf).toConstantValue(config);
    bind(API_TYPES.ApiFetch).to(ApiFetch);
  });
}
