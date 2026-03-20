import { Component, ComponentInterface, Host, Listen, Prop, State, h } from '@stencil/core';
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
  @Prop() modal!: IModal;
  @Prop() modalTitle = 'Example Modal';
  @Prop() message = 'This is an example modal component.';
  @State() selectedRadioValue = 'mapping';
  @State() tableOn = false;

  private handleConfirm = () => {
    switch (this.selectedRadioValue) {
      case 'mapping':
        if (this.tableOn) this.selectedRadioValue = 'scoring';
        break;
      case 'scoring':
        return;
      default:
        return;
    }
    this.modal.close({ confirm: true });
  };
  handleCancel = () => {
    this.modal.close({ dismiss: true });
  };
  private handleRadioChange = (event: CustomEvent) => {
    this.selectedRadioValue = event.detail.value;
  };

  @Listen('changePage')
  handleAddField(event: CustomEvent<string>) {
    this.selectedRadioValue = event.detail;
  }

  renderContent = () => {
    switch (this.selectedRadioValue) {
      case 'mapping':
        // return <movable-rows-table></movable-rows-table>;
        return <add-model></add-model>;
      case 'scoring':
        return (
          <div class="scoresDialog">
            <score-panel scope="Contactability"></score-panel>
            <score-panel scope="Propensity"></score-panel>
          </div>
        );
      case 'options':
        return <p>options.</p>;
      default:
        return null;
    }
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
            <scx-radio-group
              value={this.selectedRadioValue}
              size="medium"
              variant="light"
              onSmChange={this.handleRadioChange}
            >
              <scx-radio-button value="mapping">Mapping</scx-radio-button>
              <scx-radio-button value="scoring">Scoring</scx-radio-button>
              <scx-radio-button value="options">Options</scx-radio-button>
            </scx-radio-group>
            {this.renderContent()}
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
