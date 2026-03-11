import { Component, ComponentInterface, Host, Prop, h } from '@stencil/core';
import type { IModal } from '../../../libs/modal';

/**
 * Example Modal Component
 *
 * Demonstrates how to create a modal content component that works with the Modal Service.
 *
 * Key Patterns:
 * - Receives `modal` prop from Modal Service
 * - Calls `modal.close()` with appropriate data
 * - Uses confirm/dismiss flags to indicate user action
 * - Follows standard modal structure with modal-wrapper, modal-head, modal-content, modal-footer
 *
 * Usage:
 * ```typescript
 * import { starter } from '../../di/containers';
 *
 * const modal = starter.modal;
 *
 * modal.create({
 *   component: 'scx-example-modal',
 *   width: '500px',
 *   dismissOnEsc: true,
 *   backdropDismiss: true,
 *   componentProps: {
 *     modalTitle: 'Confirm Action',
 *     message: 'Are you sure you want to proceed?'
 *   }
 * });
 *
 * modal.onDismiss((data) => {
 *   if (data.confirm) {
 *     console.log('User confirmed');
 *   } else {
 *     console.log('User cancelled');
 *   }
 * });
 *
 * modal.show();
 * ```
 */
@Component({
  tag: 'scx-modal-example',
  styleUrl: 'scx-modal-example.scss',
  shadow: true,
})
export class ScxModalExample implements ComponentInterface {
  /**
   * Modal service reference
   * Automatically injected by Modal Service
   */
  @Prop() modal!: IModal;

  /**
   * Modal title (optional)
   * Passed via componentProps
   */
  @Prop() modalTitle = 'Example Modal';

  /**
   * Modal message (optional)
   * Passed via componentProps
   */
  @Prop() message = 'This is an example modal component.';

  /**
   * Handle confirm action
   * Closes modal with confirm flag
   */
  private handleConfirm = () => {
    this.modal.close({ confirm: true });
  };

  /**
   * Handle cancel action
   * Closes modal with dismiss flag
   */
  private handleCancel = () => {
    this.modal.close({ dismiss: true });
  };

  render() {
    return (
      <Host>
        <div class="modal-wrapper">
          <div class="modal-head">
            <div class="modal-title">{this.modalTitle}</div>
            <sl-icon-button class="modal-close" name="x-lg" label="Close" onClick={this.handleCancel}></sl-icon-button>
          </div>

          <div class="modal-content">
            <p>{this.message}</p>
          </div>

          <div class="modal-footer">
            <sl-button variant="default" onClick={this.handleCancel}>
              Cancel
            </sl-button>
            <sl-button variant="primary" onClick={this.handleConfirm}>
              Confirm
            </sl-button>
          </div>
        </div>
      </Host>
    );
  }
}
