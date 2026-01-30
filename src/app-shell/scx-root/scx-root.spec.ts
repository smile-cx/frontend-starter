import { newSpecPage } from '@stencil/core/testing';
import { ScxRoot } from './scx-root';

describe('scx-root', () => {
  it('renders loading state initially', async () => {
    const page = await newSpecPage({
      components: [ScxRoot],
      html: `<scx-root api-url="http://localhost:3001/t/test/v1"></scx-root>`,
    });

    // Component should exist
    expect(page.root).toBeTruthy();
  });

  it('accepts apiUrl prop', async () => {
    const page = await newSpecPage({
      components: [ScxRoot],
      html: `<scx-root api-url="http://localhost:3001/t/test/v1"></scx-root>`,
    });

    expect(page.rootInstance.apiUrl).toBe('http://localhost:3001/t/test/v1');
  });
});
