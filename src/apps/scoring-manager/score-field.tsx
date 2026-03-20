import { Component, Event, EventEmitter, Fragment, Prop, State, Watch, h } from '@stencil/core';
import { FieldToSend, Score } from './scoring.interface';

@Component({
  tag: 'score-field',
  styleUrl: '',
  shadow: false,
})
export class ScoreField {
  @Event() editScore!: EventEmitter<Score>;
  @Event() deleteScore!: EventEmitter<number>;
  @Event() editCheck!: EventEmitter<1 | 3 | null>;
  @Prop() field!: FieldToSend;
  @Prop() editMode!: boolean;
  @Prop() nScore!: number;
  @Prop() switch?: 1 | 3 | null;
  @State() currentScore: Score = { score: 0 };
  @State() numericScores: number[] = [];

  async componentWillLoad() {
    const current = this.field.scores.find((score) => score.score == this.nScore);
    if (current) this.currentScore = current;
    else this.currentScore.score = this.nScore;
  }
  @Watch('field')
  handleFieldChange() {
    const current = this.field.scores.find((score) => score.score == this.nScore);
    if (current) {
      this.currentScore = { ...current };
    } else {
      this.currentScore = { score: this.nScore };
    }
  }
  @Watch('switch')
  handleSwitchChange() {
    console.log('nuovo switch nel watch', this.switch);
    this.currentScore = {
      ...this.currentScore,
      boolValue: this.switch === this.nScore,
    };
  }
  clear() {
    this.currentScore = { score: this.nScore };
    this.editScore.emit(this.currentScore);
  }
  handleEditScore(value: string | number | boolean, part?: 'to' | 'from') {
    if (this.field.type === 'Numeric') {
      const current = this.currentScore.numericValue ?? { from: 0, to: 0 };

      if (part)
        this.currentScore = {
          score: this.nScore,
          numericValue: {
            ...current,
            [part]: value,
          },
        };
    } else if (this.field.type === 'String') {
      if (value == '') this.currentScore = { score: this.nScore };
      else {
        const str = String(value);
        this.currentScore = {
          score: this.nScore,
          arrayValue: str
            .split(',')
            .map((v) => v.trim())
            .filter((v) => v !== ''),
        };
      }
    } else if (this.field.type === 'Boolean' && typeof value === 'boolean') {
      this.currentScore = {
        score: this.nScore,
        boolValue: value,
      };
      this.editCheck.emit(value ? (this.nScore as 1 | 3) : null);
    }
    this.editScore.emit(this.currentScore);
  }

  getComponent() {
    switch (this.field.type) {
      case 'Boolean':
        return (
          this.editMode && (
            <sl-switch
              onsl-change={(e: Event) => {
                const target = e.target as HTMLFormElement & { value: boolean };
                this.handleEditScore(target.checked);
              }}
              disabled={this.nScore === 2}
              checked={this.currentScore.boolValue}
            >
              Has value
            </sl-switch>
          )
        );
      case 'String':
        return this.editMode ? (
          <sl-input
            value={this.currentScore.arrayValue ? this.currentScore.arrayValue.join(',') : ''}
            label={this.field.name}
            onsl-input={(e: Event) => {
              const target = e.target as HTMLFormElement & { value: string };
              this.handleEditScore(target.value);
            }}
          ></sl-input>
        ) : (
          <p>{this.currentScore.arrayValue?.join(',')}</p>
        );
      case 'Numeric':
        return this.editMode ? (
          <div class="scorebox__header__numeric">
            <sl-select
              value={this.currentScore.numericValue?.from ?? ''}
              label="from"
              onsl-input={(e: Event) => {
                const target = e.target as HTMLFormElement & { value: number };
                this.handleEditScore(target.value, 'from');
              }}
            >
              {Array.from({ length: 21 }, (_, i) => i * 5).map((valore) => (
                <sl-option key={valore} value={valore}>
                  {valore}
                </sl-option>
              ))}
            </sl-select>
            <sl-select
              label="to"
              value={this.currentScore.numericValue?.to ?? ''}
              onsl-input={(e: Event) => {
                const target = e.target as HTMLFormElement & { value: number };
                this.handleEditScore(target.value, 'to');
              }}
            >
              {Array.from({ length: 21 }, (_, i) => i * 5).map((valore) => (
                <sl-option key={valore} value={valore}>
                  {valore}
                </sl-option>
              ))}
            </sl-select>
          </div>
        ) : (
          <p>
            {this.currentScore.numericValue &&
              `${this.currentScore.numericValue?.from ?? ''}, ${this.currentScore.numericValue?.to ?? ''} `}
          </p>
        );
    }
  }

  render() {
    return (
      <Fragment>
        {this.field.type !== '' && (
          <div class="scorebox">
            <div class="scorebox__header">
              {this.field.type === 'Boolean' ? (
                !this.editMode &&
                this.currentScore.score === this.switch && (
                  <sl-tag size="medium" variant={this.nScore === 1 ? `danger` : `success`}>
                    {this.nScore}
                  </sl-tag>
                )
              ) : (
                <sl-tag
                  size="medium"
                  variant={this.nScore === 1 ? `danger` : this.nScore === 2 ? `warning` : `success`}
                >
                  {this.nScore}
                </sl-tag>
              )}
              <div>{this.getComponent()}</div>
              {this.field.type !== 'Boolean' && this.editMode && (
                <sl-button variant="text" size="large" onClick={() => this.clear()}>
                  clear
                </sl-button>
              )}
            </div>
          </div>
        )}
      </Fragment>
    );
  }
}
