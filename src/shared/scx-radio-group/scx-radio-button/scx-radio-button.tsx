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

  /**
   * The name of the control, which is submitted with the form data.
   */
  @Prop() name: string = this.inputId;

  /**
   * If `true`, the user cannot interact with the radio.
   */
  @Prop() disabled = false;

  /**
   * If `true`, the radio is selected.
   */
  @Prop({ mutable: true }) checked = false;

  /**
   * The value of the radio button.
   */
  @Prop({ mutable: true }) value?: unknown;

  /**
   * The color variant of the radio button.
   * @internal - Inherited from parent radio-group
   */
  @Prop({ mutable: true }) variant: 'default' | 'neutral' | 'light' = 'default';

  /**
   * The size of the radio button.
   * @internal - Inherited from parent radio-group, not meant to be set directly by users
   */
  @Prop({ mutable: true }) size: 'small' | 'medium' | 'large' = 'medium';

  /**
   * Emitted when the styles change.
   * @internal
   */
  @Event() smStyle!: EventEmitter<StyleEventDetail>;

  /**
   * Emitted when the radio button is selected.
   */
  @Event() smSelect!: EventEmitter<{ checked: boolean; value: unknown }>;

  /**
   * Emitted when a checked radio button is deselected.
   * @internal
   */
  @Event() smDeselect!: EventEmitter<void>;

  /**
   * Emitted when the radio button gains focus.
   */
  @Event() smFocus!: EventEmitter<void>;

  /**
   * Emitted when the radio button loses focus.
   */
  @Event() smBlur!: EventEmitter<void>;

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

  private onFocus = () => {
    if (!this.disabled) {
      this.smFocus.emit();
    }
  };

  private onBlur = () => {
    if (!this.disabled) {
      this.smBlur.emit();
    }
  };

  private onClick = () => {
    if (!this.disabled && !this.checked) {
      this.checked = true;
    }
  };

  componentWillLoad() {
    const radioGroup = this.el.closest('scx-radio-group');
    if (radioGroup) {
      if (radioGroup.variant) {
        this.variant = radioGroup.variant;
      }
      if (radioGroup.size) {
        this.size = radioGroup.size;
      }
    }
    if (this.value === undefined) {
      this.value = this.inputId;
    }
    this.emitStyle();
  }

  render() {
    const { inputId, disabled, checked, variant, size } = this;
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
          onFocus={this.onFocus}
          onBlur={this.onBlur}
          disabled={disabled}
          class={{
            checked,
            unchecked: !checked,
            disabled,
            neutral: variant === 'neutral',
            light: variant === 'light',
            small: size === 'small',
            medium: size === 'medium',
            large: size === 'large',
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
