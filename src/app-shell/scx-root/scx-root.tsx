import { Component, Host, Prop, State, h } from '@stencil/core';
import type { ComponentInterface } from '@stencil/core';
import { starter } from '../../di/containers';
import { tt } from '../../libs/i18n';

/**
 * Root Component (Application Shell)
 *
 * Responsibilities:
 * - Initialize DI container with runtime config (API base URL)
 * - Render loading state during initialization
 * - Mount application component(s) after initialization
 *
 * **IMPORTANT**: This component handles ONLY container initialization.
 * No business logic, no service usage, no subscriptions.
 *
 * Application logic belongs in app components (smilecx-outbound-manager, etc.)
 *
 * Pattern: Shell layer (init) vs Application layer (business logic)
 *
 * Usage:
 * ```html
 * <scx-root api-url="http://localhost:3001/t/acme-corp/v1"></scx-root>
 * ```
 */
@Component({
  tag: 'scx-root',
  styleUrl: 'scx-root.scss',
  shadow: true,
})
export class ScxRoot implements ComponentInterface {
  /**
   * API base URL for backend requests
   * Passed to container during initialization
   *
   * @example
   * // Development
   * api-url="http://localhost:3001/t/acme-corp/v1"
   *
   * @example
   * // Production
   * api-url="https://api.smilecx.com/t/acme-corp/v1"
   */
  @Prop() apiUrl = '';

  /**
   * Container initialization status
   * Used to render loading state vs application
   */
  @State() initialized = false;

  /**
   * Initialize DI container before rendering app
   */
  async componentWillLoad() {
    await starter.init({ apiBaseUrl: this.apiUrl });
    this.initialized = true;
  }

  render() {
    return (
      <Host>
        {this.initialized ? (
          <smilecx-outbound-manager></smilecx-outbound-manager>
        ) : (
          <div class="loading">{tt('SM.SHELL.INITIALIZING')}</div>
        )}
      </Host>
    );
  }
}
