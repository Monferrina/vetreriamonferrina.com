import { describe, it, expect } from 'vitest';
import { services, categories } from '../../src/data/services';

describe('Dati servizi', () => {
  it('ogni servizio ha slug, nome, descrizione e categoria valida', () => {
    for (const s of services) {
      expect(s.slug).toBeTruthy();
      expect(s.name).toBeTruthy();
      expect(s.description).toBeTruthy();
      expect(Object.keys(categories)).toContain(s.category);
    }
  });

  it('gli slug sono univoci', () => {
    const slugs = services.map((s) => s.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
