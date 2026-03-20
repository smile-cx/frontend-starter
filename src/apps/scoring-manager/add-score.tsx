import { Component, Event, EventEmitter, Fragment, Listen, Prop, State, Watch, h } from '@stencil/core';
import { Subscription } from 'rxjs';
import { starter } from '../../di/containers';
import { FieldToSend, Score } from './scoring.interface';

export interface Field {
  id: number;
  title: string;
  weight: number;
  field_type: string;
}

@Component({
  tag: 'add-score',
  styleUrl: 'add-score.scss',
  shadow: false,
})
export class AddScore {
  private subscriptions: Subscription[] = [];
  private mappingService = starter.mappingService;
  private scoringService = starter.scoringService;

  @Event() addField!: EventEmitter<FieldToSend>;
  @Event() deleteField!: EventEmitter<number>;
  @Event() editField!: EventEmitter<{ field: FieldToSend; key: number }>;
  @Event() closeNewDialog!: EventEmitter;

  @State() editMode = false;
  @State() checkSwitch: 1 | 3 | null = null;
  @State() selectNumberScore = 0;
  @State() fieldScore: FieldToSend = {
    id: 0,
    name: '',
    type: '',
    weight: 0,
    scores: [],
  };
  @State() scores: Score[] = [];
  @Prop() addNewField?: boolean;
  @Prop() fieldIndex = 0;
  @Prop() scope!: 'Contactability' | 'Propensity';
  @Prop() field: FieldToSend = {
    id: 0,
    name: '',
    type: '',
    weight: 0,
    scores: [],
  };

  @Watch('field')
  watchFieldHandler() {
    this.fieldScore = { ...this.field };
  }

  selectFilter(used: Set<string>) {
    const all = this.mappingService.mappingItems$.getValue();
    return all.filter((f) => {
      const name = f.aliasName ? f.aliasName : f.csvField;

      return !used.has(name) || name === this.fieldScore.name;
    });
  }
  get selectOptions() {
    if (this.scope == 'Contactability') {
      const used = new Set(this.scoringService.formToSend$.getValue().contactability.map((f) => f.name));
      return this.selectFilter(used);
    } else {
      const used = new Set(this.scoringService.formToSend$.getValue().propensity.map((f) => f.name));
      return this.selectFilter(used);
    }
  }

  async componentWillLoad() {
    this.fieldScore = { ...this.field };
    this.scores = [...this.fieldScore.scores];
    if (this.addNewField) this.editMode = true;
  }

  handleAdd() {
    this.fieldScore = {
      ...this.fieldScore,
      scores: this.scores,
    };
    this.addField.emit(this.fieldScore);
    this.editMode = false;
  }

  handleDelete() {
    this.deleteField.emit(this.fieldIndex);
    this.closeDialog();
  }

  closeDialog() {
    this.editMode = false;
    this.fieldScore = this.field;
    this.scores = [...this.fieldScore.scores];

    if (this.addNewField) {
      this.closeNewDialog.emit();
    }
  }

  handleChange() {
    this.fieldScore = {
      ...this.fieldScore,
      scores: this.scores,
    };
    this.editField.emit({
      field: this.fieldScore,
      key: this.fieldIndex,
    });

    this.editMode = false;
  }

  totalWeightEdit(e: Event) {
    const target = e.target as HTMLFormElement & { value: number };
    this.fieldScore = {
      ...this.fieldScore,
      weight: target.value,
    };
    if (!this.addNewField && !this.editMode) {
      this.editField.emit({
        field: this.fieldScore,
        key: this.fieldIndex,
      });
    }
  }

  @Listen('editCheck')
  handleEditCheck(event: CustomEvent<1 | 3 | null>) {
    this.checkSwitch = event.detail;
  }

  @Listen('editScore')
  handleEditScores(event: CustomEvent<Score>) {
    const newScore = event.detail;
    const keys = Object.keys(newScore);

    const updatedScores = [...this.scores];
    const index = updatedScores.findIndex((s) => s.score === newScore.score);

    if (index !== -1) {
      if (keys.length === 1 && keys[0] === 'score') {
        updatedScores.splice(index, 1);
      } else {
        updatedScores[index] = newScore;
      }
    } else {
      updatedScores.push(newScore);
    }
    this.scores = updatedScores.filter((score) => {
      if (this.fieldScore.type == 'String' && score.arrayValue) return true;
      else if (this.fieldScore.type == 'Numeric' && score.numericValue) return true;
      else if (this.fieldScore.type == 'Boolean' && score.boolValue && score.score === this.checkSwitch) return true;
    });
  }

  disconnectedCallback() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  render() {
    return (
      <Fragment>
        <sl-card class="card-header">
          <div slot="header" class="card-header__header">
            <div class="card-header__content">
              <sl-icon-button name="gear" label="Settings"></sl-icon-button>
              {this.editMode && !this.fieldScore.name ? <h4>Add Score</h4> : <h4>{this.fieldScore.name}</h4>}
            </div>
            <div class="card-header__content">
              {!this.editMode && (
                <sl-icon name="cv-write-strong" label="Edit" onClick={() => (this.editMode = true)}></sl-icon>
              )}
              {!this.addNewField && <sl-icon name="cv-bin" onClick={() => this.handleDelete()}></sl-icon>}
            </div>
          </div>
          <div class="card-body">
            <div class="card-body__div">
              {this.editMode && (
                <>
                  <h5>
                    Select one <span>*</span>
                  </h5>
                  <div class="card-body__select">
                    <sl-select
                      value={this.fieldScore.name}
                      onsl-change={(e: Event) => {
                        const target = e.target as HTMLFormElement & { value: string };
                        this.fieldScore = {
                          ...this.fieldScore,
                          name: target.value,
                        };
                      }}
                    >
                      {this.selectOptions.map((field) => (
                        <sl-option value={field.aliasName ? field.aliasName : field.csvField}>
                          {field.aliasName ? field.aliasName : field.csvField}
                        </sl-option>
                      ))}
                    </sl-select>
                  </div>
                </>
              )}

              <div>Weight</div>
              <sl-range value={this.fieldScore.weight} onsl-change={(e: Event) => this.totalWeightEdit(e)}></sl-range>
              <div class="scorebox scorebox__range">{this.fieldScore.weight}%</div>
            </div>
            {this.editMode && (
              <div class="card-body__fieldtype">
                <h5>Field type</h5>
                <sl-radio-group
                  name="a"
                  value={this.fieldScore.type}
                  orientation="horizontal"
                  onsl-change={(e: Event) => {
                    const target = e.target as HTMLFormElement & { value: string };
                    this.fieldScore = {
                      ...this.fieldScore,
                      type: target.value,
                    };
                  }}
                >
                  <sl-radio value="Numeric">Numeric</sl-radio>
                  <sl-radio value="String">String</sl-radio>
                  <sl-radio value="Boolean">Boolean</sl-radio>
                </sl-radio-group>
                <div class="disclaimer">
                  Assign score 1-3 based on field value. Missing values automatically get score 2.
                </div>
                {/* {this.fieldScore.scores.map((score)=>{
                    
                  })} */}
              </div>
            )}
            <div class={!this.editMode ? 'scores' : ''}>
              <score-field
                field={this.fieldScore}
                nScore={3}
                editMode={this.editMode}
                switch={this.checkSwitch}
              ></score-field>
              <score-field field={this.fieldScore} nScore={2} editMode={this.editMode}></score-field>
              <score-field
                field={this.fieldScore}
                nScore={1}
                editMode={this.editMode}
                switch={this.checkSwitch}
              ></score-field>
            </div>

            {this.editMode && (
              <div class="card-body__buttons">
                <sl-button variant="text" size="large" onClick={() => this.closeDialog()}>
                  Cancel
                </sl-button>
                <sl-button
                  type="button"
                  onClick={() => {
                    if (this.addNewField) this.handleAdd();
                    else this.handleChange();
                  }}
                  variant="neutral"
                  size="medium"
                >
                  Confirm
                </sl-button>
              </div>
            )}
          </div>
        </sl-card>
      </Fragment>
    );
  }
}
