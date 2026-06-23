import { describe, it, expect } from 'vitest';
import { serviceDetails } from '../../src/data/service-details';
import { services } from '../../src/data/services';

const slugs = new Set(services.map((s) => s.slug));

describe('Dettagli servizi', () => {
  it('ogni servizio ha i dettagli corrispondenti', () => {
    for (const s of services) {
      expect(serviceDetails[s.slug], `manca service-details per ${s.slug}`).toBeTruthy();
    }
  });

  it('ogni slug in related esiste ed è curato (3 elementi, no auto-riferimento, no duplicati)', () => {
    for (const [slug, detail] of Object.entries(serviceDetails)) {
      if (!detail.related) continue;
      expect(detail.related.length, `related di ${slug} deve avere 3 elementi`).toBe(3);
      expect(new Set(detail.related).size, `related di ${slug} ha duplicati`).toBe(
        detail.related.length
      );
      for (const rel of detail.related) {
        expect(slugs.has(rel), `related di ${slug} punta a slug inesistente: ${rel}`).toBe(true);
        expect(rel, `${slug} non deve referenziare se stesso`).not.toBe(slug);
      }
    }
  });

  it('ogni pagina servizio riceve almeno 2 link interni curati (ILR sano)', () => {
    const incoming = new Map<string, number>();
    for (const detail of Object.values(serviceDetails)) {
      for (const rel of detail.related ?? []) {
        incoming.set(rel, (incoming.get(rel) ?? 0) + 1);
      }
    }
    for (const s of services) {
      expect(
        incoming.get(s.slug) ?? 0,
        `${s.slug} ha meno di 2 link interni curati`
      ).toBeGreaterThanOrEqual(2);
    }
  });
});
