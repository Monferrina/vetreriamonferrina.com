// @vitest-environment node
import { describe, it, expect } from 'vitest';
import AvvisoChiusura from '../../src/components/AvvisoChiusura.astro';
import { renderPage, text } from './render-page';
import { chiusureDaMostrare, type Chiusura } from '../../src/lib/chiusure';
import dati from '../../src/data/chiusure.json';

// Ferie d'agosto: l'avviso parte 14 giorni prima (26/07) e sparisce dopo l'ultimo giorno (23/08).
const ferie = { dal: '2027-08-09', al: '2027-08-23', motivo: 'ferie' };
// Ferragosto dentro la finestra delle ferie; l'Immacolata a dicembre, fuori.
const ferragosto = { dal: '2027-08-14', al: '2027-08-16', motivo: 'Ferragosto' };
const immacolata = { dal: '2027-12-08', al: '2027-12-08', motivo: "l'Immacolata" };

describe('chiusureDaMostrare', () => {
  it("mostra la chiusura dal preavviso di 14 giorni fino all'ultimo giorno compreso", () => {
    expect(chiusureDaMostrare([ferie], '2027-07-25')).toEqual([]);
    expect(chiusureDaMostrare([ferie], '2027-07-26')).toEqual([ferie]);
    expect(chiusureDaMostrare([ferie], '2027-08-23')).toEqual([ferie]);
    expect(chiusureDaMostrare([ferie], '2027-08-24')).toEqual([]);
  });

  it('mostra tutte le chiusure nella finestra, non solo la prima', () => {
    expect(chiusureDaMostrare([ferie, ferragosto, immacolata], '2027-08-10')).toEqual([
      ferie,
      ferragosto,
    ]);
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

// Gli avvisi escono visibili dal build (il sito è statico), così si leggono anche senza
// JavaScript; lo script del browser nasconde quelli fuori dalla finestra di chiusureDaMostrare.
describe('Avviso di chiusura', () => {
  it('porta nella pagina un avviso visibile per ogni chiusura, con testo e date', async () => {
    const d = await renderPage(AvvisoChiusura, '/', { props: { chiusure: [ferie, ferragosto] } });
    const avvisi = [...d.querySelectorAll('[data-chiusura]')];
    expect(avvisi.map(text)).toEqual([
      'Chiusi per ferie dal 9 agosto al 23 agosto.',
      'Chiusi per Ferragosto dal 14 agosto al 16 agosto.',
    ]);
    expect(avvisi.map((a) => [a.getAttribute('data-dal'), a.getAttribute('data-al')])).toEqual([
      ['2027-08-09', '2027-08-23'],
      ['2027-08-14', '2027-08-16'],
    ]);
    expect(avvisi.some((a) => a.hasAttribute('hidden'))).toBe(false);
  });
});
