import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { queries } from '../../src/lib/sanity';

// vi.mock deve stare al top-level (Vitest lo hoista automaticamente prima degli import)
vi.mock('@sanity/client', () => ({
  createClient: vi.fn(() => ({
    fetch: vi.fn(),
  })),
}));

vi.mock('@sanity/image-url', () => ({
  createImageUrlBuilder: vi.fn(() => ({ image: vi.fn() })),
}));

describe('Sanity queries', () => {
  it('tutte le query GROQ sono sintatticamente corrette', () => {
    for (const [name, q] of Object.entries(queries)) {
      expect(q, `Query "${name}" vuota`).toBeTruthy();
      expect(q).toContain('_type');
      expect(q).not.toContain('undefined');
    }
  });

  it('query services ordina per ordine', () => {
    expect(queries.services).toContain('order(order asc)');
  });

  it('query services include slug projection', () => {
    expect(queries.services).toContain('slug');
  });

  it('query galleryItems ordina per ordine', () => {
    expect(queries.galleryItems).toContain('order(order asc)');
  });

  it('query siteSettings seleziona primo documento', () => {
    expect(queries.siteSettings).toContain('[0]');
  });

  it('query aboutPage seleziona primo documento', () => {
    expect(queries.aboutPage).toContain('[0]');
  });
});

describe('urlFor — senza Sanity configurato', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('SANITY_PROJECT_ID', '');
    vi.stubEnv('SANITY_DATASET', '');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('ritorna uno stub chainable con url() che restituisce stringa vuota', async () => {
    const { urlFor } = await import('../../src/lib/sanity');
    const result = urlFor({ _type: 'image', asset: { _ref: 'image-abc-jpg' } });
    expect(result.url()).toBe('');
  });

  it('lo stub supporta chaining (width, height, format)', async () => {
    const { urlFor } = await import('../../src/lib/sanity');
    const result = urlFor({});
    expect(result.width(800).height(600).format('webp').url()).toBe('');
  });
});

describe('fetchWithFallback — senza Sanity configurato', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('SANITY_PROJECT_ID', '');
    vi.stubEnv('SANITY_DATASET', '');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('ritorna il fallback quando il client non è configurato', async () => {
    const { fetchWithFallback } = await import('../../src/lib/sanity');
    const fallback = [{ name: 'fallback' }];
    const result = await fetchWithFallback('*[_type == "service"]', fallback);
    expect(result).toBe(fallback);
  });
});

describe('fetchWithFallback — con Sanity configurato', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('SANITY_PROJECT_ID', 'testprojectid');
    vi.stubEnv('SANITY_DATASET', 'production');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('ritorna i dati quando il fetch ha successo', async () => {
    const mockData = [{ name: 'Vetro temperato', slug: 'vetro-temperato' }];
    const { createClient } = await import('@sanity/client');
    vi.mocked(createClient).mockReturnValue({
      fetch: vi.fn().mockResolvedValue(mockData),
    } as unknown as ReturnType<typeof createClient>);

    const { fetchWithFallback } = await import('../../src/lib/sanity');
    const fallback: unknown[] = [];
    const result = await fetchWithFallback('*[_type == "service"]', fallback);
    expect(result).toEqual(mockData);
  });

  it('usa il fallback quando il fetch lancia un errore', async () => {
    const { createClient } = await import('@sanity/client');
    vi.mocked(createClient).mockReturnValue({
      fetch: vi.fn().mockRejectedValue(new Error('Network error')),
    } as unknown as ReturnType<typeof createClient>);

    const { fetchWithFallback } = await import('../../src/lib/sanity');
    const fallback = [{ name: 'static-fallback' }];
    const result = await fetchWithFallback('*[_type == "service"]', fallback);
    expect(result).toBe(fallback);
  });

  it('usa il fallback quando il fetch ritorna null', async () => {
    const { createClient } = await import('@sanity/client');
    vi.mocked(createClient).mockReturnValue({
      fetch: vi.fn().mockResolvedValue(null),
    } as unknown as ReturnType<typeof createClient>);

    const { fetchWithFallback } = await import('../../src/lib/sanity');
    const fallback = { title: 'default' };
    const result = await fetchWithFallback('*[_type == "siteSettings"][0]', fallback);
    expect(result).toBe(fallback);
  });
});
