import { Component, ComponentInterface, Element, Event, EventEmitter, Host, Prop, Watch, h } from '@stencil/core';

export interface StyleEventDetail {
  'radio-checked': boolean;
  'interactive-disabled': boolean;
}
@Component({
  tag: 'scx-radio-button',
  styleUrl: 'scx-radio-button.scss',
  shadow: true,
})
export class ScxRadioButton implements ComponentInterface {
  private inputId = `scx-rb-${radioButtonIds++}`;

  @Element() el!: HTMLElement;

  @Prop() name: string = this.inputId;

  @Prop() disabled = false;

  @Prop({ mutable: true }) checked = false;

  @Prop({ mutable: true }) value?: unknown;

  @Event() smStyle!: EventEmitter<StyleEventDetail>;

  @Event() smSelect!: EventEmitter<{ checked: boolean; value: unknown }>;

  @Event() smDeselect!: EventEmitter<void>;

  @Watch('checked')
  checkedChanged(isChecked: boolean) {
    if (isChecked) {
      this.smSelect.emit({ checked: true, value: this.value });
    }
    this.emitStyle();
  }

  @Watch('disabled')
  disabledChanged() {
    this.emitStyle();
  }

  private emitStyle() {
    this.smStyle.emit({
      'radio-checked': this.checked,
      'interactive-disabled': this.disabled,
    });
  }

  private onClick = () => {
    if (!this.disabled && !this.checked) {
      this.checked = true;
    }
  };

  componentWillLoad() {
    if (this.value === undefined) {
      this.value = this.inputId;
    }
    this.emitStyle();
  }

  render() {
    const { inputId, disabled, checked } = this;
    const labelId = `${inputId}-lbl`;

    return (
      <Host
        onClick={this.onClick}
        role="radio"
        aria-disabled={disabled ? 'true' : null}
        aria-checked={`${checked}`}
        aria-labelledby={labelId}
        class={{
          interactive: true,
          'radio-checked': checked,
          'radio-disabled': disabled,
        }}
      >
        <button
          type="button"
          disabled={disabled}
          class={{
            checked,
            unchecked: !checked,
            disabled,
          }}
        >
          <slot name="prefix"></slot>
          <slot></slot>
          <slot name="suffix"></slot>
        </button>
      </Host>
    );
  }
}

let radioButtonIds = 0;
