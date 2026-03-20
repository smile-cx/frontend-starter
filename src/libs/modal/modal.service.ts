import { injectable } from 'inversify';
import type { IModal, IModalCloseData, ModalOpts } from './modal.interface';

/**
 * Modal Service
 *
 * Lightweight modal dialog system built on native HTML <dialog> element.
 *
 * Features:
 * - Native <dialog> API (no third-party libraries)
 * - CSS animations for open/close transitions
 * - ESC key dismissal (configurable)
 * - Backdrop click dismissal (configurable)
 * - Dynamic component instantiation
 * - Promise-based close handling
 *
 * Architecture:
 * - Transient scope: Each modal gets its own instance
 * - Component-based: Modal content is a custom element (Stencil component)
 * - Event-driven: Uses native dialog events (cancel, click, animationend)
 *
 * Lifecycle:
 * 1. create() - Creates dialog element and component
 * 2. onDismiss() - Registers close callback
 * 3. show() - Displays modal using showModal()
 * 4. close() - Animates out and removes from DOM
 *
 * Usage:
 * ```typescript
 * import { starter } from '../../di/containers';
 *
 * const modal = starter.modal;
 *
 * modal.create({
 *   component: 'user-settings-modal',
 *   width: '800px',
 *   dismissOnEsc: true,
 *   backdropDismiss: true,
 *   componentProps: { userId: '123' }
 * });
 *
 * modal.onDismiss((data) => {
 *   if (data.confirm) {
 *     console.log('Settings saved');
 *   }
 * });
 *
 * modal.show();
 * ```
 */
@injectable()
export class Modal implements IModal {
  /** Reference to native <dialog> element */
  private dialogRef: HTMLDialogElement | null = null;

  /** Reference to component instance inside dialog */
  private componentRef: HTMLElement | null = null;

  /** Callback function invoked on modal close */
  private onDismissCallback: ((data: IModalCloseData) => void) | null = null;

  /** Configuration options */
  private opts: ModalOpts | null = null;

  /**
   * Create modal dialog
   *
   * Creates native <dialog> element, instantiates component,
   * and sets up event listeners.
   *
   * @param opt - Modal configuration options
   */
  create(opt: ModalOpts): void {
    this.opts = opt;

    // Create native <dialog> element
    this.dialogRef = document.createElement('dialog');
    this.dialogRef.style.width = opt.width;

    if (opt.height) {
      this.dialogRef.style.height = opt.height;
    }

    // Create component instance
    this.componentRef = document.createElement(opt.component);

    // Pass modal reference to component (allows component to call close())
    (this.componentRef as HTMLElement & { modal: IModal }).modal = this;

    // Pass custom props to component
    if (opt.componentProps) {
      Object.entries(opt.componentProps).forEach(([key, value]) => {
        (this.componentRef as unknown as Record<string, unknown>)[key] = value;
      });
    }

    // Add component to dialog
    this.dialogRef.appendChild(this.componentRef);

    // Append dialog to body
    document.body.appendChild(this.dialogRef);

    // Setup event listeners
    this.setupEventListeners();
  }

  /**
   * Setup event listeners for ESC key and backdrop click
   */
  private setupEventListeners(): void {
    if (!this.dialogRef || !this.opts) return;

    // ESC key dismissal
    // The 'cancel' event fires when user presses ESC
    this.dialogRef.addEventListener('cancel', (e) => {
      if (this.opts?.dismissOnEsc === false) {
        // Prevent default ESC behavior if disabled
        e.preventDefault();
      } else {
        // Allow ESC to close modal
        this.close({ dismiss: true });
      }
    });

    // Backdrop click dismissal
    // Clicking the dialog element itself (not content) closes modal
    this.dialogRef.addEventListener('click', (e) => {
      if (this.opts?.backdropDismiss !== false && e.target === this.dialogRef) {
        this.close({ dismiss: true });
      }
    });
  }

  /**
   * Register dismiss callback
   *
   * @param callback - Function to invoke when modal closes
   */
  onDismiss(callback: (data: IModalCloseData) => void): void {
    this.onDismissCallback = callback;
  }

  /**
   * Show modal
   *
   * Uses native dialog.showModal() which:
   * - Makes dialog visible
   * - Adds modal behavior (prevents interaction with page content)
   * - Shows backdrop
   * - Manages focus trap
   */
  show(): void {
    if (!this.dialogRef) {
      console.error('Modal: Cannot show modal - dialog not created');
      return;
    }

    this.dialogRef.showModal();
  }

  /**
   * Close modal with animation
   *
   * Process:
   * 1. Add 'close' class to trigger CSS animation
   * 2. Wait for animationend event (or fallback timeout)
   * 3. Call dismiss callback
   * 4. Remove dialog from DOM
   * 5. Clean up references
   *
   * @param data - Data to pass to onDismiss callback
   * @returns Promise that resolves when close completes
   */
  async close(data: IModalCloseData): Promise<void> {
    if (!this.dialogRef) {
      console.error('Modal: Cannot close modal - dialog not created');
      return;
    }

    return new Promise((resolve) => {
      if (!this.dialogRef) {
        resolve();
        return;
      }

      // Add close animation class
      this.dialogRef.classList.add('close');

      // Animation complete handler
      const onAnimationEnd = () => {
        this.cleanup(data);
        resolve();
      };

      // Listen for animation end
      this.dialogRef.addEventListener('animationend', onAnimationEnd, { once: true });

      // Fallback timeout in case animationend doesn't fire
      // (e.g., animations disabled, browser issues)
      setTimeout(() => {
        if (this.dialogRef) {
          this.dialogRef.removeEventListener('animationend', onAnimationEnd);
          this.cleanup(data);
          resolve();
        }
      }, 400); // 400ms = slightly longer than animation duration (300ms)
    });
  }

  /**
   * Cleanup dialog and invoke callback
   *
   * Removes dialog from DOM and cleans up all references.
   * This is called after close animation completes.
   *
   * @param data - Data to pass to onDismiss callback
   */
  private cleanup(data: IModalCloseData): void {
    // Invoke dismiss callback
    if (this.onDismissCallback) {
      this.onDismissCallback(data);
    }

    // Remove dialog from DOM
    if (this.dialogRef) {
      this.dialogRef.remove();
    }

    // Clear references
    this.dialogRef = null;
    this.componentRef = null;
    this.onDismissCallback = null;
    this.opts = null;
  }
}
