import { Component, ComponentInterface, Host, Prop, h } from '@stencil/core';

@Component({
  tag: 'scx-empty-state',
  styleUrl: 'scx-empty-state.scss',
  shadow: true,
})
export class ScxEmptyState implements ComponentInterface {
  @Prop() icon!: string;
  @Prop() label?: string;
  @Prop() esTitle?: string;

  render() {
    return (
      <Host>
        <div class="icon-wrap">
          <sl-icon size="extra" name={this.icon}></sl-icon>
        </div>
        {this.esTitle ? (
          <div class="title-wrap">
            <span>{this.esTitle}</span>
          </div>
        ) : null}
        {this.label ? (
          <div class="label-wrap">
            <span innerHTML={this.label}></span>
          </div>
        ) : null}
        <slot></slot>
      </Host>
    );
  }
}
