import { ContainerModule } from 'inversify';
import { MODAL_TYPES } from '../../di/types';
import type { IModal } from './modal.interface';
import { Modal } from './modal.service';

/**
 * Modal Module
 *
 * Inversify DI module for modal service registration.
 *
 * Scope: Transient
 * Each modal.create() call should get a fresh instance to prevent state
 * from previous modals affecting new ones.
 *
 * Usage:
 * ```typescript
 * // In container initialization
 * import { modalModule } from '../libs/modal/modal.module';
 * container.load(modalModule);
 *
 * // Access service
 * const modal = container.get<IModal>(MODAL_TYPES.Modal);
 * ```
 *
 * Pattern (Inversify 7.x):
 * Uses destructured { bind } syntax (not direct bind parameter)
 *
 * @see https://inversify.io/ for Inversify documentation
 */
export const modalModule = new ContainerModule(({ bind }) => {
  bind<IModal>(MODAL_TYPES.Modal).to(Modal).inTransientScope();
});
