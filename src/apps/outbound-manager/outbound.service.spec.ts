import { Container } from 'inversify';
import 'reflect-metadata';
import { API_TYPES, LOGGER_TYPES } from '../../di/types';
import type { IApiFetch, IApiResponse } from '../../libs/api';
import type { ILogger } from '../../libs/logger';
import { StarterDebugNamespaces } from '../../libs/logger';
import type { Campaign } from './outbound.interface';
import { OutboundService } from './outbound.service';
import { OUTBOUND_TYPES } from './outbound.types';

describe('OutboundService', () => {
  let container: Container;
  let service: OutboundService;
  let mockApiFetch: jest.Mocked<IApiFetch>;
  let mockLogger: jest.Mocked<ILogger>;

  beforeEach(() => {
    // Create mock API fetch
    mockApiFetch = {
      doGet: jest.fn(),
      doPost: jest.fn(),
      doPut: jest.fn(),
      doDelete: jest.fn(),
      doPatch: jest.fn(),
      doPostFile: jest.fn(),
      doGetText: jest.fn(),
      getServerDateDiff: jest.fn(),
      composePath: jest.fn(),
    };

    // Create mock logger
    const mockLoggerInstance = {
      debug: jest.fn(),
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };
    mockLogger = {
      getLogger: jest.fn().mockReturnValue(mockLoggerInstance),
    };

    // Setup DI container
    container = new Container();
    container.bind(API_TYPES.ApiFetch).toConstantValue(mockApiFetch);
    container.bind(LOGGER_TYPES.Logger).toConstantValue(mockLogger);
    container.bind(OUTBOUND_TYPES.OutboundService).to(OutboundService);

    service = container.get<OutboundService>(OUTBOUND_TYPES.OutboundService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with empty state', () => {
      expect(service.campaigns$.value).toEqual([]);
      expect(service.selectedCampaign$.value).toBeNull();
      expect(service.loading$.value).toBe(false);
    });

    it('should get logger with Outbound namespace', () => {
      expect(mockLogger.getLogger).toHaveBeenCalledWith(StarterDebugNamespaces.Outbound);
    });
  });

  describe('loadCampaigns', () => {
    it('should load campaigns successfully', async () => {
      const mockCampaigns: Campaign[] = [
        { id: '1', name: 'Campaign 1', status: 'active', dialedCount: 100, connectedCount: 50 },
        { id: '2', name: 'Campaign 2', status: 'paused', dialedCount: 200, connectedCount: 75 },
      ];

      const mockResponse: IApiResponse<Campaign[]> = {
        ok: true,
        status: 200,
        data: mockCampaigns,
      };

      mockApiFetch.doGet.mockResolvedValue(mockResponse);

      await service.loadCampaigns();

      expect(mockApiFetch.doGet).toHaveBeenCalledWith('/campaigns');
      expect(service.campaigns$.value).toEqual(mockCampaigns);
      expect(service.loading$.value).toBe(false);
    });

    it('should handle API error', async () => {
      const mockResponse: IApiResponse<Campaign[]> = {
        ok: false,
        status: 500,
        error: { message: 'Server error' },
      };

      mockApiFetch.doGet.mockResolvedValue(mockResponse);

      await service.loadCampaigns();

      expect(service.campaigns$.value).toEqual([]);
      expect(service.loading$.value).toBe(false);
    });

    it('should set loading state during request', async () => {
      const mockResponse: IApiResponse<Campaign[]> = {
        ok: true,
        status: 200,
        data: [],
      };

      mockApiFetch.doGet.mockResolvedValue(mockResponse);

      const loadingStates: boolean[] = [];
      service.loading$.subscribe((loading) => loadingStates.push(loading));

      await service.loadCampaigns();

      // Should have: initial false, true during load, false after
      expect(loadingStates).toContain(true);
      expect(service.loading$.value).toBe(false);
    });

    it('should handle unexpected errors gracefully', async () => {
      mockApiFetch.doGet.mockRejectedValue(new Error('Network error'));

      await service.loadCampaigns();

      expect(service.campaigns$.value).toEqual([]);
      expect(service.loading$.value).toBe(false);
    });
  });

  describe('selectCampaign', () => {
    beforeEach(async () => {
      const mockCampaigns: Campaign[] = [
        { id: '1', name: 'Campaign 1', status: 'active', dialedCount: 100, connectedCount: 50 },
        { id: '2', name: 'Campaign 2', status: 'paused', dialedCount: 200, connectedCount: 75 },
      ];

      mockApiFetch.doGet.mockResolvedValue({
        ok: true,
        status: 200,
        data: mockCampaigns,
      });

      await service.loadCampaigns();
    });

    it('should select campaign by id', () => {
      service.selectCampaign('1');

      expect(service.selectedCampaign$.value).toEqual({
        id: '1',
        name: 'Campaign 1',
        status: 'active',
        dialedCount: 100,
        connectedCount: 50,
      });
    });

    it('should handle non-existent campaign', () => {
      service.selectCampaign('999');

      expect(service.selectedCampaign$.value).toBeNull();
    });

    it('should update selectedCampaign$ observable', () => {
      const selections: (Campaign | null)[] = [];
      service.selectedCampaign$.subscribe((campaign) => selections.push(campaign));

      service.selectCampaign('1');
      service.selectCampaign('2');

      expect(selections.length).toBeGreaterThan(0);
      expect(selections[selections.length - 1]?.id).toBe('2');
    });
  });

  describe('startCampaign', () => {
    const mockCampaign: Campaign = {
      id: '1',
      name: 'Campaign 1',
      status: 'paused',
      dialedCount: 100,
      connectedCount: 50,
    };

    beforeEach(async () => {
      mockApiFetch.doGet.mockResolvedValue({
        ok: true,
        status: 200,
        data: [mockCampaign],
      });
      await service.loadCampaigns();
    });

    it('should start campaign successfully', async () => {
      const updatedCampaign: Campaign = { ...mockCampaign, status: 'active' };
      mockApiFetch.doPost.mockResolvedValue({
        ok: true,
        status: 200,
        data: updatedCampaign,
      });

      const result = await service.startCampaign('1');

      expect(result).toBe(true);
      expect(mockApiFetch.doPost).toHaveBeenCalledWith('/campaigns/1/start', {});
      expect(service.campaigns$.value[0]?.status).toBe('active');
    });

    it('should update selected campaign if it matches', async () => {
      service.selectCampaign('1');

      const updatedCampaign: Campaign = { ...mockCampaign, status: 'active' };
      mockApiFetch.doPost.mockResolvedValue({
        ok: true,
        status: 200,
        data: updatedCampaign,
      });

      await service.startCampaign('1');

      expect(service.selectedCampaign$.value?.status).toBe('active');
    });

    it('should handle API error', async () => {
      mockApiFetch.doPost.mockResolvedValue({
        ok: false,
        status: 500,
        error: { message: 'Server error' },
      });

      const result = await service.startCampaign('1');

      expect(result).toBe(false);
      expect(service.campaigns$.value[0]?.status).toBe('paused'); // Unchanged
    });
  });

  describe('pauseCampaign', () => {
    const mockCampaign: Campaign = {
      id: '1',
      name: 'Campaign 1',
      status: 'active',
      dialedCount: 100,
      connectedCount: 50,
    };

    beforeEach(async () => {
      mockApiFetch.doGet.mockResolvedValue({
        ok: true,
        status: 200,
        data: [mockCampaign],
      });
      await service.loadCampaigns();
    });

    it('should pause campaign successfully', async () => {
      const updatedCampaign: Campaign = { ...mockCampaign, status: 'paused' };
      mockApiFetch.doPost.mockResolvedValue({
        ok: true,
        status: 200,
        data: updatedCampaign,
      });

      const result = await service.pauseCampaign('1');

      expect(result).toBe(true);
      expect(mockApiFetch.doPost).toHaveBeenCalledWith('/campaigns/1/pause', {});
      expect(service.campaigns$.value[0]?.status).toBe('paused');
    });

    it('should update selected campaign if it matches', async () => {
      service.selectCampaign('1');

      const updatedCampaign: Campaign = { ...mockCampaign, status: 'paused' };
      mockApiFetch.doPost.mockResolvedValue({
        ok: true,
        status: 200,
        data: updatedCampaign,
      });

      await service.pauseCampaign('1');

      expect(service.selectedCampaign$.value?.status).toBe('paused');
    });

    it('should handle API error', async () => {
      mockApiFetch.doPost.mockResolvedValue({
        ok: false,
        status: 500,
        error: { message: 'Server error' },
      });

      const result = await service.pauseCampaign('1');

      expect(result).toBe(false);
      expect(service.campaigns$.value[0]?.status).toBe('active'); // Unchanged
    });
  });

  describe('BehaviorSubject state management', () => {
    it('should emit initial values to subscribers', (done) => {
      service.campaigns$.subscribe((campaigns) => {
        expect(Array.isArray(campaigns)).toBe(true);
        done();
      });
    });

    it('should emit updates to all subscribers', async () => {
      const mockCampaigns: Campaign[] = [
        { id: '1', name: 'Campaign 1', status: 'active', dialedCount: 100, connectedCount: 50 },
      ];

      const emissions: Campaign[][] = [];
      service.campaigns$.subscribe((campaigns) => emissions.push([...campaigns]));

      mockApiFetch.doGet.mockResolvedValue({
        ok: true,
        status: 200,
        data: mockCampaigns,
      });

      await service.loadCampaigns();

      // Should have at least initial empty array and loaded campaigns
      expect(emissions.length).toBeGreaterThan(1);
      expect(emissions[emissions.length - 1]).toEqual(mockCampaigns);
    });
  });
});
