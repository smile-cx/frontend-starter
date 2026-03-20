/**
 * Modal Library
 *
 * Exports for the modal service, interfaces, and module.
 *
 * Usage:
 * ```typescript
 * import type { IModal, ModalOpts, IModalCloseData } from '../../libs/modal';
 * ```
 */

export type { IModal, IModalCloseData, ModalOpts } from './modal.interface';
export { Modal } from './modal.service';
export { modalModule } from './modal.module';
