import type { BehaviorSubject } from 'rxjs';

/**
 * Campaign Model
 *
 * Represents an outbound calling campaign
 */
export interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'completed';
  dialedCount: number;
  connectedCount: number;
}

/**
 * Outbound Service Interface
 *
 * Manages outbound campaigns with reactive state (BehaviorSubject).
 * Follows non-throwing async pattern: all methods resolve (never reject).
 *
 * Service is injected via DI and accessed through container getter.
 */
export interface IOutboundService {
  /**
   * Observable list of campaigns
   * Subscribe to receive updates when campaigns are loaded or change
   */
  campaigns$: BehaviorSubject<Campaign[]>;

  /**
   * Currently selected campaign
   * Subscribe to track selection changes
   */
  selectedCampaign$: BehaviorSubject<Campaign | null>;

  /**
   * Loading state indicator
   * Subscribe to show/hide loading spinners
   */
  loading$: BehaviorSubject<boolean>;

  /**
   * Load campaigns from API
   * Updates campaigns$ on success, sets loading$ state
   *
   * @returns Promise that always resolves (never throws)
   */
  loadCampaigns(): Promise<void>;

  /**
   * Select a campaign by ID
   * Updates selectedCampaign$ if found
   *
   * @param id - Campaign ID to select
   */
  selectCampaign(id: string): void;

  /**
   * Start a campaign
   * Updates campaign status on success
   *
   * @param id - Campaign ID to start
   * @returns Promise<boolean> - true if successful, false if failed
   */
  startCampaign(id: string): Promise<boolean>;

  /**
   * Pause a campaign
   * Updates campaign status on success
   *
   * @param id - Campaign ID to pause
   * @returns Promise<boolean> - true if successful, false if failed
   */
  pauseCampaign(id: string): Promise<boolean>;
}
