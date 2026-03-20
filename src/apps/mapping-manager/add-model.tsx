import { Component, ComponentInterface, Element, Fragment, State, h } from '@stencil/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { starter } from '../../di/containers';
import type { Model } from '../mapping-manager/mapping.interface';

@Component({
  tag: 'add-model',
  styleUrl: 'add-model.scss',
  shadow: false,
})
export class AddModel implements ComponentInterface {
  @Element() el!: HTMLElement;
  private fileInput?: HTMLInputElement;
  @State() modelName = '';
  @State() fileName = '';
  @State() showMappingTable = false;
  @State() userModel: Model | null = null;

  private subscriptions: Subscription[] = [];

  async componentWillLoad() {
    const service = starter.mappingService;
    this.subscriptions.push(
      service.UserModel$.subscribe((model) => {
        this.userModel = model;
      })
    );
  }
  private handleIconClick = () => {
    this.fileInput?.click();
  };

  private handleFileChange = (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0] as File;
      this.fileName = file.name;
    } else {
      this.fileName = '';
    }
  };

  private saveModel() {
    // Get model name from state
    const modelName = this.modelName.trim();

    // Get file value
    const file = this.fileInput?.files && this.fileInput.files.length > 0 ? (this.fileInput.files[0] as File) : null;

    if (!modelName) {
      alert('Please enter a model name.');
      return;
    }
    if (!file) {
      alert('Please select a model file.');
      return;
    }
    // Proceed with saving logic
    const model: Model = {
      name: modelName,
      fileName: file.name,
      campaignId: '', // Add campaignId if needed
    };

    const service = starter.mappingService;
    service.saveModel(model);

    //this.showMappingTable = true;
  }

  render() {
    return (
      <div class="vertical-cards-container">
        {this.userModel && this.userModel.name && this.userModel.fileName ? (
          <movable-rows-table></movable-rows-table>
        ) : (
          <Fragment>
            <sl-card>
              <div class="card-body">
                <div class="card-body__div">
                  <sl-input
                    name="modelName"
                    label="Model Name"
                    placeholder="Insert model name"
                    required
                    style={{ width: '100%' }}
                    value={this.modelName || ''}
                    onInput={(event: Event) => (this.modelName = (event.target as HTMLInputElement).value)}
                  ></sl-input>
                </div>
              </div>
            </sl-card>
            <sl-card class="upload-card">
              <div class="card-body">
                <div class="card-body__div">
                  <input
                    type="file"
                    style={{ display: 'none' }}
                    ref={(el) => (this.fileInput = el as HTMLInputElement)}
                    onChange={this.handleFileChange}
                    accept=".xlsx,.csv"
                  />
                  <scx-empty-state
                    icon="cv-cloud-up"
                    esTitle={this.fileName || 'Drag and drop your model list here'}
                    label="Supported formats: .XLSX .CSV"
                    onIconClick={this.handleIconClick}
                  ></scx-empty-state>
                </div>
              </div>
            </sl-card>
            <div class="add-model-button">
              <sl-button variant="default">Cancel</sl-button>
              <sl-button variant="primary" onClick={() => this.saveModel()}>
                Save
              </sl-button>
            </div>
          </Fragment>
        )}
      </div>
    );
  }
}
