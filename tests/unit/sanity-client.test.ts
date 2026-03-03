import { describe, it, expect } from 'vitest';
import { queries } from '../../src/lib/sanity';

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
