import { Component, ComponentInterface, Host, State, h } from '@stencil/core';

/**
 * Range Example Component
 *
 * Demonstrates various use cases of the Shoelace sl-range component with different configurations.
 *
 * Features:
 * - Basic range slider with default settings
 * - Custom min, max, and step values
 * - Range with labels and help text
 * - Range with tooltip for real-time value display
 * - Disabled state demonstration
 * - Multiple ranges with different configurations
 * - Real-time value updates
 *
 * Usage:
 * ```html
 * <scx-example-range></scx-example-range>
 * ```
 *
 * sl-range Documentation:
 * https://shoelace.style/components/range
 */
@Component({
  tag: 'scx-example-range',
  styleUrl: 'scx-example-range.scss',
  shadow: true,
})
export class ScxExampleRange implements ComponentInterface {
  /**
   * Value for basic range
   */
  @State() basicValue = 50;

  /**
   * Value for volume range (0-100)
   */
  @State() volumeValue = 75;

  /**
   * Value for temperature range (-10 to 40)
   */
  @State() temperatureValue = 20;

  /**
   * Value for price range (with step)
   */
  @State() priceValue = 50;

  /**
   * Value for percentage range
   */
  @State() percentageValue = 65;

  /**
   * Handle basic range input
   */
  private handleBasicInput = (event: Event) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.basicValue = (event.target as any).value;
  };

  /**
   * Handle volume range input
   */
  private handleVolumeInput = (event: Event) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.volumeValue = (event.target as any).value;
  };

  /**
   * Handle temperature range input
   */
  private handleTemperatureInput = (event: Event) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.temperatureValue = (event.target as any).value;
  };

  /**
   * Handle price range input
   */
  private handlePriceInput = (event: Event) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.priceValue = (event.target as any).value;
  };

  /**
   * Handle percentage range input
   */
  private handlePercentageInput = (event: Event) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.percentageValue = (event.target as any).value;
  };

  render() {
    return (
      <Host>
        <div class="range-example-container">
          <div class="header">
            <h2>Range Slider Examples</h2>
            <p class="subtitle">Various configurations of the Shoelace sl-range component</p>
          </div>

          <div class="examples-grid">
            {/* Basic Range */}
            <div class="example-card">
              <div class="example-header">
                <h3>Basic Range</h3>
                <span class="value-display">{this.basicValue}</span>
              </div>
              <p class="example-description">A simple range slider with default settings (0-100).</p>
              <div class="example-content">
                <sl-range value={this.basicValue} onSl-input={this.handleBasicInput}></sl-range>
              </div>
              <div class="code-sample">
                <code>{`<sl-range value={${this.basicValue}}></sl-range>`}</code>
              </div>
            </div>

            {/* Range with Label */}
            <div class="example-card">
              <div class="example-header">
                <h3>Volume Control</h3>
                <span class="value-display">{this.volumeValue}%</span>
              </div>
              <p class="example-description">Range with label and help text.</p>
              <div class="example-content">
                <sl-range
                  label="Volume"
                  help-text="Adjust the volume level"
                  value={this.volumeValue}
                  onSl-input={this.handleVolumeInput}
                ></sl-range>
              </div>
              <div class="code-sample">
                <code>{`<sl-range label="Volume" help-text="..." value={${this.volumeValue}}></sl-range>`}</code>
              </div>
            </div>

            {/* Custom Min/Max Range */}
            <div class="example-card">
              <div class="example-header">
                <h3>Temperature Range</h3>
                <span class="value-display">{this.temperatureValue}°C</span>
              </div>
              <p class="example-description">Custom min (-10) and max (40) values.</p>
              <div class="example-content">
                <sl-range
                  label="Temperature"
                  min={-10}
                  max={40}
                  value={this.temperatureValue}
                  onSl-input={this.handleTemperatureInput}
                ></sl-range>
              </div>
              <div class="code-sample">
                <code>{`<sl-range min={-10} max={40} value={${this.temperatureValue}}></sl-range>`}</code>
              </div>
            </div>

            {/* Range with Step */}
            <div class="example-card">
              <div class="example-header">
                <h3>Price Range (with Step)</h3>
                <span class="value-display">€{this.priceValue}</span>
              </div>
              <p class="example-description">Range with step value of 5 (snaps to increments).</p>
              <div class="example-content">
                <sl-range
                  label="Price"
                  min={0}
                  max={100}
                  step={5}
                  value={this.priceValue}
                  onSl-input={this.handlePriceInput}
                ></sl-range>
              </div>
              <div class="code-sample">
                <code>{`<sl-range step={5} value={${this.priceValue}}></sl-range>`}</code>
              </div>
            </div>

            {/* Range with Tooltip */}
            <div class="example-card">
              <div class="example-header">
                <h3>Range with Tooltip</h3>
                <span class="value-display">{this.percentageValue}%</span>
              </div>
              <p class="example-description">Shows value in a tooltip while dragging.</p>
              <div class="example-content">
                <sl-range
                  label="Completion"
                  tooltip="top"
                  value={this.percentageValue}
                  onSl-input={this.handlePercentageInput}
                ></sl-range>
              </div>
              <div class="code-sample">
                <code>{`<sl-range tooltip="top" value={${this.percentageValue}}></sl-range>`}</code>
              </div>
            </div>

            {/* Disabled Range */}
            <div class="example-card">
              <div class="example-header">
                <h3>Disabled State</h3>
                <span class="value-display disabled-badge">Disabled</span>
              </div>
              <p class="example-description">A disabled range slider that cannot be interacted with.</p>
              <div class="example-content">
                <sl-range label="Disabled Range" value={30} disabled></sl-range>
              </div>
              <div class="code-sample">
                <code>{`<sl-range disabled value={30}></sl-range>`}</code>
              </div>
            </div>
          </div>

          <div class="footer">
            <div class="info-box">
              <sl-icon name="info-circle"></sl-icon>
              <div class="info-content">
                <h4>Key Properties</h4>
                <ul>
                  <li>
                    <strong>value:</strong> Current value of the range
                  </li>
                  <li>
                    <strong>min/max:</strong> Minimum and maximum values (default: 0-100)
                  </li>
                  <li>
                    <strong>step:</strong> Increment value (default: 1)
                  </li>
                  <li>
                    <strong>label:</strong> Accessible label for the range
                  </li>
                  <li>
                    <strong>help-text:</strong> Help text below the range
                  </li>
                  <li>
                    <strong>tooltip:</strong> Show value tooltip ("top", "bottom", "none")
                  </li>
                  <li>
                    <strong>disabled:</strong> Disable the range slider
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Host>
    );
  }
}
