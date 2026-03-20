import { Component, Fragment, Listen, Prop, State, Watch, h } from '@stencil/core';
import { Subscription } from 'rxjs';
import { starter } from '../../di/containers';
import { FieldToSend, FormToSend } from '../scoring-manager/scoring.interface';

@Component({
  tag: 'score-panel',
  styleUrl: 'score-panel.scss',
  shadow: false,
})
export class ScorePanel {
  private scoringService = starter.scoringService;
  private subscriptions: Subscription[] = [];
  @State() fieldsToSend: FieldToSend[] = [];
  @State() formToSend: FormToSend = { contactability: [], propensity: [] };
  @State() addNewField: boolean = false;
  @State() totalWeight: number = 0;
  @Prop() scope!: 'Contactability' | 'Propensity';

  async componentWillLoad() {
    // this.subscriptions.push(
    //   this.scoringService.fieldsToSend$.subscribe((fields) => {
    //     this.fieldsToSend = fields;
    //   })
    // );

    this.subscriptions.push(
      this.scoringService.formToSend$.subscribe((fields) => {
        this.fieldsToSend = this.scope === 'Contactability' ? fields.contactability : fields.propensity;
      })
    );

    if (this.scope === 'Contactability')
      this.subscriptions.push(
        this.scoringService.totalweightContactability$.subscribe((fields) => {
          this.totalWeight = fields;
        })
      );
    else
      this.subscriptions.push(
        this.scoringService.totalweightPropensity$.subscribe((fields) => {
          this.totalWeight = fields;
        })
      );
  }

  @Watch('fieldsToSend')
  editWeight() {
    this.scoringService.editTotalWeight(this.scope);
  }

  @Listen('addField')
  handleAddField(event: CustomEvent<FieldToSend>) {
    console.log('add', event.detail);
    this.addNewField = false;
    this.scoringService.addFieldToSend(event.detail, this.scope);
  }
  @Listen('deleteField')
  handleDeleteField(event: CustomEvent<number>) {
    this.scoringService.deleteField(event.detail, this.scope);
  }

  @Listen('closeNewDialog')
  handleCloseNewDialog() {
    this.addNewField = false;
  }

  @Listen('editField')
  handleChangeField(event: CustomEvent<{ field: FieldToSend; key: number }>) {
    console.log('edit', event.detail);
    this.scoringService.editFieldsToSend(event.detail.field, event.detail.key, this.scope);
  }
  disconnectedCallback() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
  render() {
    return (
      <Fragment>
        <div class="singleScorePanel">
          <div class="score-panel-header">
            <div class="score-panel-header__title">{this.scope} Score (CS)</div>
            <div class="score-panel-header__amount">
              <p
                class={`score-panel-header__amount__value ${this.totalWeight != 100 && `score-panel-header__amount__value__border`}`}
              >
                Total Weight:&nbsp;&nbsp;
                <span class={`weight ${this.totalWeight < 100 ? 'orange' : this.totalWeight > 100 ? 'red' : 'green'}`}>
                  {this.totalWeight}%
                </span>
              </p>
              {this.totalWeight != 100 && (
                <span class="score-panel-header__amount__button">
                  <sl-button variant="neutral" size="medium" onClick={() => this.scoringService.normalize(this.scope)}>
                    Normalize 100%
                  </sl-button>
                </span>
              )}
            </div>
          </div>
          <div class="score-panel-add">
            <sl-button size="small" onClick={() => (this.addNewField = true)}>
              <sl-icon slot="prefix" name="plus"></sl-icon> Add score
            </sl-button>
          </div>
          <div class="score-panel-body">
            {this.addNewField && <add-score addNewField={this.addNewField} scope={this.scope}></add-score>}
            {this.fieldsToSend.length > 0 ? (
              this.fieldsToSend.map((field, index) => (
                <add-score fieldIndex={index} key={index} field={field} scope={this.scope}>
                  {' '}
                </add-score>
              ))
            ) : (
              <div class="score-panel-body__empty">
                <sl-icon name="cv-search-r"></sl-icon>
                <h4>No scores applied yet</h4>
                <p>
                  Apply at least one score to reach 100% of
                  <br />
                  {this.scope} Score (CS) weight.
                </p>
              </div>
            )}
          </div>
        </div>
      </Fragment>
    );
  }
}
