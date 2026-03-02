import { describe, it, expect } from 'vitest';
import { services, categories, getServicesByCategory } from '../../src/data/services';

describe('Dati servizi', () => {
  it('ogni servizio ha slug, nome, descrizione e categoria valida', () => {
    for (const s of services) {
      expect(s.slug).toBeTruthy();
      expect(s.name).toBeTruthy();
      expect(s.description).toBeTruthy();
      expect(Object.keys(categories)).toContain(s.category);
    }
  });

  it('ci sono almeno 15 servizi', () => {
    expect(services.length).toBeGreaterThanOrEqual(15);
  });

  it('getServicesByCategory filtra correttamente', () => {
    const installazioni = getServicesByCategory('installazioni');
    expect(installazioni.length).toBe(6);
    expect(installazioni.every((s) => s.category === 'installazioni')).toBe(true);

    const vetri = getServicesByCategory('vetri');
    expect(vetri.length).toBe(7);

    const lavorazioni = getServicesByCategory('lavorazioni');
    expect(lavorazioni.length).toBe(3);
  });

  it('gli slug sono univoci', () => {
    const slugs = services.map((s) => s.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
