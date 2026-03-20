/**
 * Modal Service - TypeScript Interfaces
 *
 * Type definitions for the native HTML <dialog>-based modal system.
 *
 * Key Features:
 * - Native dialog element support
 * - Configurable dismissal behavior (ESC key, backdrop click)
 * - Dynamic component loading with props
 * - Promise-based close callbacks
 *
 * Usage:
 * ```typescript
 * const modal = starter.modal;
 *
 * modal.create({
 *   component: 'my-modal-content',
 *   width: '500px',
 *   dismissOnEsc: true,
 *   backdropDismiss: true,
 *   componentProps: { userId: '123' }
 * });
 *
 * modal.onDismiss((data) => {
 *   if (data.confirm) {
 *     console.log('User confirmed');
 *   }
 * });
 *
 * modal.show();
 * ```
 */

/**
 * Modal Configuration Options
 *
 * Configuration object passed to modal.create()
 */
export interface ModalOpts {
  /** Modal width (e.g., '500px', '80%', '100vw') */
  width: string;

  /** Modal height (optional, defaults to auto) */
  height?: string;

  /** Allow ESC key to dismiss modal (default: true) */
  dismissOnEsc?: boolean;

  /** Allow clicking backdrop to dismiss modal (default: true) */
  backdropDismiss?: boolean;

  /** Web component tag name to render inside modal */
  component: string;

  /** Props to pass to the component instance */
  componentProps?: Record<string, unknown>;
}

/**
 * Modal Close Data
 *
 * Data structure passed to onDismiss callback when modal closes.
 * Contains flags indicating how the modal was closed and optional custom data.
 */
export interface IModalCloseData {
  /** True if user confirmed (e.g., clicked OK button) */
  confirm?: boolean;

  /** True if user dismissed (ESC key or backdrop click) */
  dismiss?: boolean;

  /** Additional custom data from modal component */
  [key: string]: unknown;
}

/**
 * Modal Service Interface
 *
 * Service contract for creating and managing modal dialogs.
 * Implemented by Modal class in modal.service.ts
 */
export interface IModal {
  /**
   * Create modal dialog
   *
   * Creates native <dialog> element and dynamic component instance.
   * Does NOT show the modal - call show() to display it.
   *
   * @param opt - Modal configuration options
   *
   * @example
   * modal.create({
   *   component: 'user-settings-modal',
   *   width: '800px',
   *   height: '600px',
   *   dismissOnEsc: true,
   *   backdropDismiss: true,
   *   componentProps: { userId: '123' }
   * });
   */
  create(opt: ModalOpts): void;

  /**
   * Register dismiss callback
   *
   * Callback is invoked when modal closes via:
   * - User action (confirm button)
   * - ESC key (if dismissOnEsc is true)
   * - Backdrop click (if backdropDismiss is true)
   * - Programmatic close() call
   *
   * @param callback - Function to call on modal close
   *
   * @example
   * modal.onDismiss((data) => {
   *   if (data.confirm) {
   *     console.log('Confirmed with data:', data);
   *   } else if (data.dismiss) {
   *     console.log('Dismissed');
   *   }
   * });
   */
  onDismiss(callback: (data: IModalCloseData) => void): void;

  /**
   * Show modal
   *
   * Displays the modal using native dialog.showModal().
   * Modal must be created first via create().
   *
   * @example
   * modal.create({ component: 'my-modal', width: '500px' });
   * modal.show();
   */
  show(): void;

  /**
   * Close modal with animation
   *
   * Triggers close animation, then removes dialog from DOM.
   * Invokes onDismiss callback with provided data.
   *
   * @param data - Data to pass to onDismiss callback
   * @returns Promise that resolves when close animation completes
   *
   * @example
   * // In modal component
   * await this.modal.close({ confirm: true, userId: '123' });
   */
  close(data: IModalCloseData): Promise<void>;
}
