import { Component, ComponentInterface, Host, State, h } from '@stencil/core';

/**
 * Icon Example Component
 *
 * Displays all custom Covisian icons from the CDN with search and copy functionality.
 */

interface IconData {
  name: string;
  title: string;
  categories: string[];
  tags: string[];
}

@Component({
  tag: 'scx-icons-example',
  styleUrl: 'scx-icons-example.scss',
  shadow: true,
})
export class ScxIconsExample implements ComponentInterface {
  /**
   * All icons loaded from CDN
   */
  @State() allIcons: IconData[] = [];

  /**
   * Filtered icons based on search
   */
  @State() filteredIcons: IconData[] = [];

  /**
   * Search query
   */
  @State() searchQuery = '';

  /**
   * Recently copied icon name (for feedback)
   */
  @State() copiedIcon = '';

  /**
   * Loading state
   */
  @State() isLoading = true;

  /**
   * Error state
   */
  @State() error = '';

  async componentWillLoad() {
    await this.loadIcons();
  }

  /**
   * Load icons from CDN
   */
  private async loadIcons() {
    try {
      this.isLoading = true;
      const response = await fetch('https://smart-cdn.app.covisian.com/web/v1/svg/icons.json');

      if (!response.ok) {
        throw new Error(`Failed to load icons: ${response.statusText}`);
      }

      const icons: IconData[] = await response.json();
      this.allIcons = icons;
      this.filteredIcons = icons;
      this.isLoading = false;
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Failed to load icons';
      this.isLoading = false;
    }
  }

  /**
   * Handle search input
   */
  private handleSearch = (event: CustomEvent) => {
    const target = event.target as HTMLInputElement;
    this.searchQuery = target.value.toLowerCase();
    this.filterIcons();
  };

  /**
   * Filter icons based on search query
   */
  private filterIcons() {
    if (!this.searchQuery.trim()) {
      this.filteredIcons = this.allIcons;
      return;
    }

    this.filteredIcons = this.allIcons.filter((icon) => icon.name.toLowerCase().includes(this.searchQuery));
  }

  /**
   * Copy icon name to clipboard
   */
  private async copyIconName(iconName: string) {
    try {
      await navigator.clipboard.writeText(iconName);
      this.copiedIcon = iconName;

      // Clear copied feedback after 2 seconds
      setTimeout(() => {
        this.copiedIcon = '';
      }, 2000);
    } catch (err) {
      console.error('Failed to copy icon name:', err);
    }
  }

  /**
   * Handle icon click
   */
  private handleIconClick = (iconName: string) => {
    this.copyIconName(iconName);
  };

  render() {
    return (
      <Host>
        <div class="icons-example-container">
          <div class="header">
            <h2>Custom Icons Library</h2>
            <p class="subtitle">
              {this.allIcons.length} custom Covisian icons available. Click any icon to copy its name.
            </p>
          </div>

          <div class="search-container">
            <sl-input
              placeholder="Search icons by name..."
              value={this.searchQuery}
              onSl-input={this.handleSearch}
              clearable
            >
              <sl-icon slot="prefix" name="cv-search"></sl-icon>
            </sl-input>
          </div>

          {this.isLoading && (
            <div class="loading-state">
              <sl-spinner></sl-spinner>
              <p>Loading icons...</p>
            </div>
          )}

          {this.error && (
            <div class="error-state">
              <sl-icon name="exclamation-triangle"></sl-icon>
              <p>{this.error}</p>
            </div>
          )}

          {!this.isLoading && !this.error && (
            <div class="icons-grid">
              {this.filteredIcons.length === 0 ? (
                <div class="no-results">
                  <sl-icon name="inbox"></sl-icon>
                  <p>No icons found matching "{this.searchQuery}"</p>
                </div>
              ) : (
                this.filteredIcons.map((icon) => (
                  <div
                    class={{
                      'icon-card': true,
                      copied: this.copiedIcon === icon.name,
                    }}
                    onClick={() => this.handleIconClick(icon.name)}
                  >
                    <div class="icon-wrapper">
                      <sl-icon name={icon.name}></sl-icon>
                    </div>
                    <div class="icon-name">{icon.name}</div>
                    {this.copiedIcon === icon.name && (
                      <div class="copied-badge">
                        <sl-icon name="cv-checkbox-tick"></sl-icon>
                        Copied!
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {!this.isLoading && !this.error && this.filteredIcons.length > 0 && (
            <div class="footer">
              <p>
                Showing {this.filteredIcons.length} of {this.allIcons.length} icons
              </p>
            </div>
          )}
        </div>
      </Host>
    );
  }
}
