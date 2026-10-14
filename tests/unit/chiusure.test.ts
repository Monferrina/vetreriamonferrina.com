// @vitest-environment node
import { describe, it, expect } from 'vitest';
import AvvisoChiusura from '../../src/components/AvvisoChiusura.astro';
import { renderPage, text } from './render-page';
import { chiusuraDaMostrare, type Chiusura } from '../../src/lib/chiusure';
import dati from '../../src/data/chiusure.json';

// Ferie d'agosto: l'avviso parte 14 giorni prima (26/07) e sparisce dopo l'ultimo giorno (23/08).
const ferie = { dal: '2027-08-09', al: '2027-08-23', motivo: 'ferie' };

describe('chiusuraDaMostrare', () => {
  it("mostra la chiusura dal preavviso di 14 giorni fino all'ultimo giorno compreso", () => {
    expect(chiusuraDaMostrare([ferie], '2027-07-25')).toBeNull();
    expect(chiusuraDaMostrare([ferie], '2027-07-26')).toEqual(ferie);
    expect(chiusuraDaMostrare([ferie], '2027-08-23')).toEqual(ferie);
    expect(chiusuraDaMostrare([ferie], '2027-08-24')).toBeNull();
  });
});

// Il file lo modifica a mano il manutentore: un errore di battitura deve bloccare il merge in CI,
// non andare online come avviso sbagliato o mai mostrato.
describe('Dati delle chiusure straordinarie', () => {
  it('ogni chiusura ha date reali in formato AAAA-MM-GG, con dal non dopo al, e un motivo', () => {
    const dataReale = (d: string) =>
      /^\d{4}-\d{2}-\d{2}$/.test(d) && new Date(`${d}T00:00:00Z`).toISOString().startsWith(d);
    for (const c of dati as Chiusura[]) {
      expect(dataReale(c.dal), `data non valida: ${c.dal}`).toBe(true);
      expect(dataReale(c.al), `data non valida: ${c.al}`).toBe(true);
      expect(c.dal <= c.al, `${c.dal} viene dopo ${c.al}`).toBe(true);
      expect(c.motivo.trim()).not.toBe('');
    }
  });
});

// L'avviso esce nascosto dal build (il sito è statico) con le date per lo script del browser,
// che lo mostra solo nella finestra scelta da chiusuraDaMostrare.
describe('Avviso di chiusura', () => {
  it('porta nella pagina il testo e le date della chiusura, nascosto', async () => {
    const d = await renderPage(AvvisoChiusura, '/', { props: { chiusure: [ferie] } });
    const avviso = d.querySelector('[data-chiusura]');
    expect(text(avviso)).toBe('Chiusi per ferie dal 9 agosto al 23 agosto.');
    expect(avviso?.getAttribute('data-dal')).toBe('2027-08-09');
    expect(avviso?.getAttribute('data-al')).toBe('2027-08-23');
    expect(avviso?.hasAttribute('hidden')).toBe(true);
  });
});
