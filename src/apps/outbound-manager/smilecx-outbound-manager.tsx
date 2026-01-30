import { Component, Host, State, h } from '@stencil/core';
import type { ComponentInterface } from '@stencil/core';
import { Subscription } from 'rxjs';
import { starter } from '../../di/containers';
import { tt } from '../../libs/i18n';
import type { Campaign } from './outbound.interface';

/**
 * Outbound Manager Application Component
 *
 * Demonstrates core patterns for SmileCX applications:
 * - Service access via container getter (NOT @Prop injection)
 * - Reactive state with BehaviorSubject subscriptions
 * - Lifecycle management (subscribe in componentWillLoad, unsubscribe in disconnectedCallback)
 * - Event handlers for user interactions
 * - i18n with tt() function
 *
 * This component is the reference implementation for external developers
 * building their own SmileCX-compatible applications.
 *
 * Pattern: Application layer (business logic + UI)
 */
@Component({
  tag: 'smilecx-outbound-manager',
  styleUrl: 'smilecx-outbound-manager.scss',
  shadow: true,
})
export class SmilecxOutboundManager implements ComponentInterface {
  // Local state from service observables
  @State() campaigns: Campaign[] = [];
  @State() selectedCampaign: Campaign | null = null;
  @State() loading = false;

  // Subscription management
  private subscriptions: Subscription[] = [];

  /**
   * Subscribe to service observables and load initial data
   */
  componentWillLoad() {
    const service = starter.outbound;

    // Subscribe to campaigns
    this.subscriptions.push(
      service.campaigns$.subscribe((campaigns) => {
        this.campaigns = campaigns;
      })
    );

    // Subscribe to selected campaign
    this.subscriptions.push(
      service.selectedCampaign$.subscribe((campaign) => {
        this.selectedCampaign = campaign;
      })
    );

    // Subscribe to loading state
    this.subscriptions.push(
      service.loading$.subscribe((loading) => {
        this.loading = loading;
      })
    );

    // Load campaigns
    service.loadCampaigns();
  }

  /**
   * Cleanup subscriptions to prevent memory leaks
   */
  disconnectedCallback() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  /**
   * Handle campaign selection
   */
  private handleCampaignSelect = (id: string) => {
    starter.outbound.selectCampaign(id);
  };

  /**
   * Handle start campaign action
   */
  private handleStartCampaign = async () => {
    if (!this.selectedCampaign) return;
    await starter.outbound.startCampaign(this.selectedCampaign.id);
  };

  /**
   * Handle pause campaign action
   */
  private handlePauseCampaign = async () => {
    if (!this.selectedCampaign) return;
    await starter.outbound.pauseCampaign(this.selectedCampaign.id);
  };

  render() {
    return (
      <Host>
        <div class="outbound-manager">
          <h1>{tt('SM.OUTBOUND.TITLE')}</h1>

          {this.loading ? (
            <div class="loading">{tt('SM.OUTBOUND.LOADING')}</div>
          ) : this.campaigns.length === 0 ? (
            <p>{tt('SM.OUTBOUND.NO_CAMPAIGNS')}</p>
          ) : (
            <div class="campaigns-list">
              {this.campaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  class={{
                    'campaign-item': true,
                    selected: campaign.id === this.selectedCampaign?.id,
                  }}
                  onClick={() => this.handleCampaignSelect(campaign.id)}
                >
                  <h3>{campaign.name}</h3>
                  <p>
                    {tt('SM.OUTBOUND.CAMPAIGN.STATUS')}:{' '}
                    <span class={`status ${campaign.status}`}>{campaign.status}</span>
                  </p>
                  <div class="stats">
                    <span>
                      {tt('SM.OUTBOUND.CAMPAIGN.DIALED')}: {campaign.dialedCount}
                    </span>
                    <span>
                      {tt('SM.OUTBOUND.CAMPAIGN.CONNECTED')}: {campaign.connectedCount}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {this.selectedCampaign && (
            <div class="campaign-actions">
              <button
                class="btn-primary"
                onClick={this.handleStartCampaign}
                disabled={this.selectedCampaign.status === 'active'}
              >
                {tt('SM.OUTBOUND.CAMPAIGN.START')}
              </button>
              <button
                class="btn-secondary"
                onClick={this.handlePauseCampaign}
                disabled={this.selectedCampaign.status === 'paused'}
              >
                {tt('SM.OUTBOUND.CAMPAIGN.PAUSE')}
              </button>
            </div>
          )}
        </div>
      </Host>
    );
  }
}
