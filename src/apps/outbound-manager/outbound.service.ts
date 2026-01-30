import { inject, injectable } from 'inversify';
import { BehaviorSubject } from 'rxjs';
import { API_TYPES } from '../../di/types';
import { LOGGER_TYPES } from '../../di/types';
import type { IApiFetch } from '../../libs/api';
import type { ILogger } from '../../libs/logger';
import { StarterDebugNamespaces } from '../../libs/logger';
import type { Campaign, IOutboundService } from './outbound.interface';

/**
 * Outbound Service Implementation
 *
 * Manages outbound campaigns with reactive state using BehaviorSubject.
 * Demonstrates core patterns:
 * - Dependency Injection: Logger and ApiFetch injected via constructor
 * - Reactive State: BehaviorSubject for campaigns$, selectedCampaign$, loading$
 * - Non-throwing API: All async methods resolve (never reject)
 * - Logging: Operation start/success/error at debug, log, error levels
 *
 * @injectable Marks this class for DI injection
 */
@injectable()
export class OutboundService implements IOutboundService {
  private logger = this.loggerService.getLogger(StarterDebugNamespaces.Outbound);

  // Reactive state
  campaigns$ = new BehaviorSubject<Campaign[]>([]);
  selectedCampaign$ = new BehaviorSubject<Campaign | null>(null);
  loading$ = new BehaviorSubject<boolean>(false);

  constructor(
    @inject(LOGGER_TYPES.Logger) private loggerService: ILogger,
    @inject(API_TYPES.ApiFetch) private apiFetch: IApiFetch
  ) {
    this.logger.log('OutboundService initialized');
  }

  /**
   * Load campaigns from API
   */
  async loadCampaigns(): Promise<void> {
    this.logger.debug('Loading campaigns...');
    this.loading$.next(true);

    try {
      const response = await this.apiFetch.doGet<Campaign[]>('/campaigns');

      if (response.ok && response.data) {
        this.campaigns$.next(response.data);
        this.logger.log(`Loaded ${response.data.length} campaigns`);
      } else {
        this.logger.error('Failed to load campaigns:', response.error?.message);
        this.campaigns$.next([]);
      }
    } catch (error) {
      // Should never happen (non-throwing API), but handle defensively
      this.logger.error('Unexpected error loading campaigns:', error);
      this.campaigns$.next([]);
    } finally {
      this.loading$.next(false);
    }
  }

  /**
   * Select a campaign by ID
   */
  selectCampaign(id: string): void {
    this.logger.debug('Selecting campaign:', id);

    const campaign = this.campaigns$.value.find((c) => c.id === id);
    if (campaign) {
      this.selectedCampaign$.next(campaign);
      this.logger.log('Campaign selected:', campaign.name);
    } else {
      this.logger.error('Campaign not found:', id);
      this.selectedCampaign$.next(null);
    }
  }

  /**
   * Start a campaign
   */
  async startCampaign(id: string): Promise<boolean> {
    this.logger.debug('Starting campaign:', id);

    const response = await this.apiFetch.doPost<Campaign>(`/campaigns/${id}/start`, {});

    if (response.ok && response.data) {
      const updatedCampaign = response.data;

      // Update campaign in list
      const campaigns = this.campaigns$.value.map((c) => (c.id === id ? updatedCampaign : c));
      this.campaigns$.next(campaigns);

      // Update selected if it's the same campaign
      if (this.selectedCampaign$.value?.id === id) {
        this.selectedCampaign$.next(updatedCampaign);
      }

      this.logger.log('Campaign started:', id);
      return true;
    } else {
      this.logger.error('Failed to start campaign:', response.error?.message);
      return false;
    }
  }

  /**
   * Pause a campaign
   */
  async pauseCampaign(id: string): Promise<boolean> {
    this.logger.debug('Pausing campaign:', id);

    const response = await this.apiFetch.doPost<Campaign>(`/campaigns/${id}/pause`, {});

    if (response.ok && response.data) {
      const updatedCampaign = response.data;

      // Update campaign in list
      const campaigns = this.campaigns$.value.map((c) => (c.id === id ? updatedCampaign : c));
      this.campaigns$.next(campaigns);

      // Update selected if it's the same campaign
      if (this.selectedCampaign$.value?.id === id) {
        this.selectedCampaign$.next(updatedCampaign);
      }

      this.logger.log('Campaign paused:', id);
      return true;
    } else {
      this.logger.error('Failed to pause campaign:', response.error?.message);
      return false;
    }
  }
}
