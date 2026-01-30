import { SmilecxOutboundManager } from './smilecx-outbound-manager';

describe('smilecx-outbound-manager', () => {
  it('is defined', () => {
    expect(SmilecxOutboundManager).toBeDefined();
  });

  it('has tag name', () => {
    expect(SmilecxOutboundManager.name).toBe('SmilecxOutboundManager');
  });
});
