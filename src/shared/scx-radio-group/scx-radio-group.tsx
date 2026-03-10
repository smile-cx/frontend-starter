import { Component, ComponentInterface, Element, Event, EventEmitter, Host, Prop, Watch, h } from '@stencil/core';

export interface RadioGroupChangeEventDetail {
  value: unknown;
}
@Component({
  tag: 'scx-radio-group',
  styleUrl: 'scx-radio-group.scss',
  shadow: true,
})
export class ScxRadioGroup implements ComponentInterface {
  private inputId = `scx-rg-${radioGroupIds++}`;
  private labelId = `${this.inputId}-lbl`;
  private mutationO?: MutationObserver;

  @Element() el!: HTMLElement;

  /**
   * If `true`, the radios can be deselected.
   */
  @Prop() allowEmptySelection = false;

  /**
   * The name of the control, which is submitted with the form data.
   */
  @Prop() name: string = this.inputId;

  /**
   * The value of the radio group.
   */
  @Prop({ mutable: true }) value?: unknown | null;

  /**
   * The size of the radio buttons.
   */
  @Prop() size: 'small' | 'medium' | 'large' = 'medium';

  /**
   * The size variant of the radio group. With hug each button accords its size to its content.
   */
  @Prop() contain: 'fill' | 'hug' = 'fill';

  /**
   * The color variant of the radio group.
   */
  @Prop() variant: 'default' | 'neutral' | 'light' = 'default';

  @Watch('value')
  valueChanged(value: unknown | undefined) {
    this.updateRadios();
    this.smChange.emit({ value });
  }

  @Watch('size')
  async sizeChanged() {
    await this.updateRadioButtonSizes();
  }

  /**
   * Emitted when the value has changed.
   */
  @Event() smChange!: EventEmitter<RadioGroupChangeEventDetail>;

  private async updateRadios() {
    const radios = await this.getRadios();
    const { value } = this;

    let hasChecked = false;

    for (const radio of radios) {
      if (!hasChecked && radio.value === value) {
        hasChecked = true;
        radio.checked = true;
      } else {
        radio.checked = false;
      }
    }

    if (!hasChecked) {
      this.value = undefined;
    }
    return Promise.resolve();
  }

  private getRadios() {
    return Promise.all(
      Array.from(this.el.querySelectorAll('scx-radio-button')).map((radio) => radio.componentOnReady())
    );
  }

  private onSelect = (ev: Event) => {
    const selectedRadio = ev.target as HTMLScxRadioButtonElement | null;
    if (selectedRadio) {
      this.value = selectedRadio.value;
    }
  };

  private onDeselect = (ev: Event) => {
    const selectedRadio = ev.target as HTMLScxRadioButtonElement | null;
    if (selectedRadio) {
      selectedRadio.checked = false;
      this.value = undefined;
    }
  };

  private async updateRadioButtonSizes() {
    const radios = await this.getRadios();
    radios.forEach((radio: HTMLScxRadioButtonElement) => {
      // Access the internal state directly
      (radio as HTMLScxRadioButtonElement & { size: string }).size = this.size;
    });
  }

  async connectedCallback() {
    const el = this.el;

    if (this.value === undefined) {
      const radio = findCheckedOption(el, 'scx-radio-button') as HTMLScxRadioButtonElement | undefined;
      if (radio !== undefined) {
        await radio.componentOnReady();
        if (this.value === undefined) {
          this.value = radio.value;
        }
      }
    }

    this.mutationO = watchForOptions<HTMLScxRadioButtonElement>(el, 'scx-radio-button', (newOption) => {
      if (newOption !== undefined) {
        newOption.componentOnReady().then(() => {
          this.value = newOption.value;
        });
      } else {
        this.updateRadios();
      }
    });

    await this.updateRadios();
    this.updateRadioButtonSizes();
  }

  disconnectedCallback() {
    if (this.mutationO) {
      this.mutationO.disconnect();
      this.mutationO = undefined;
    }
  }

  render() {
    return (
      <Host
        role="radiogroup"
        variant={this.variant}
        contain={this.contain}
        aria-labelledby={this.labelId}
        onSmSelect={this.onSelect}
        onSmDeselect={this.allowEmptySelection ? this.onDeselect : undefined}
      >
        <slot></slot>
      </Host>
    );
  }
}

// Helper functions

let radioGroupIds = 0;

const watchForOptions = <T extends HTMLElement>(
  containerEl: HTMLElement,
  tagName: string,
  onChange: (el: T | undefined) => void
) => {
  const mutation = new MutationObserver((mutationList) => {
    onChange(getSelectedOption<T>(mutationList, tagName));
  });
  mutation.observe(containerEl, {
    childList: true,
    subtree: true,
  });
  return mutation;
};

const getSelectedOption = <T extends HTMLElement>(mutationList: MutationRecord[], tagName: string): T | undefined => {
  let newOption: HTMLElement | undefined;
  mutationList.forEach((mut) => {
    for (const node of Array.from(mut.addedNodes)) {
      newOption = findCheckedOption(node, tagName) || newOption;
    }
  });
  return newOption as T | undefined;
};

const findCheckedOption = (el: Node, tagName: string): HTMLElement | undefined => {
  if (el.nodeType !== 1) {
    return undefined;
  }
  const htmlEl = el as HTMLElement;
  const options: HTMLElement[] =
    htmlEl.tagName === tagName.toUpperCase() ? [htmlEl] : Array.from(htmlEl.querySelectorAll(tagName));

  return options.find((o: HTMLElement & { checked?: boolean }) => o.checked === true);
};
