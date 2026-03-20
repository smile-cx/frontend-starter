import { Component, Host, Listen, Prop, State, h } from '@stencil/core';
import type { ComponentInterface } from '@stencil/core';
import { starter } from '../../di/containers';
import { tt } from '../../libs/i18n';

@Component({
  tag: 'scx-root',
  styleUrl: 'scx-root.scss',
  shadow: true,
})
export class ScxRoot implements ComponentInterface {
  @Prop() apiUrl = '';
  @State() initialized = false;
  @State() selectedRadioValue = 'mapping';
  @State() lastModalResult = 'Not opened yet';

  async componentWillLoad() {
    await starter.init({ apiBaseUrl: this.apiUrl });
    this.initialized = true;
  }
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
  private openModal = () => {
    const modal = starter.modal;

    modal.create({
      component: 'scx-modal-example',
      width: '90%',
      height: '90%',
      dismissOnEsc: true,
      backdropDismiss: true,
      componentProps: {
        modalTitle: 'Example Modal',
        message: 'This is an example modal created with the Modal Service. Try clicking the buttons or pressing ESC!',
      },
    });

    modal.onDismiss((data) => {
      if (data.confirm) {
        this.lastModalResult = '✅ User confirmed';
      } else if (data.dismiss) {
        this.lastModalResult = '❌ User dismissed';
      }
    });

    modal.show();
  };

  render() {
    return (
      <Host>
        {this.initialized ? (
          <div>
            <sl-button onClick={this.openModal}>Open Modal</sl-button>
            <p class="result">Last result: {this.lastModalResult}</p>
            {/* <scx-radio-group
              value={this.selectedRadioValue}
              size="medium"
              variant="light"
              onSmChange={this.handleRadioChange}
            >
              <scx-radio-button value="mapping">Mapping</scx-radio-button>
              <scx-radio-button value="scoring">Scoring</scx-radio-button>
              <scx-radio-button value="options">Options</scx-radio-button>
            </scx-radio-group>
            {this.renderContent()} */}
          </div>
        ) : (
          <div class="loading">{tt('SM.SHELL.INITIALIZING')}</div>
        )}
      </Host>
    );
  }
}
