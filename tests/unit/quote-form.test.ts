// @vitest-environment node
// Struttura del form preventivi sull'HTML: prima erano E2E, ma non usavano il browser
// (T1, passo 3). Il comportamento del form (validazione, invio) resta negli E2E.
import { beforeAll, describe, expect, test } from 'vitest';
import { renderPage } from './render-page';
import Preventivo from '../../src/pages/preventivo.astro';

describe('form preventivo', () => {
  let d: Document;
  beforeAll(async () => {
    d = await renderPage(Preventivo, '/preventivo');
  });

  test('ha tutti i campi, misure comprese', () => {
    for (const sel of [
      'input[name="name"]',
      'input[name="phone"]',
      'input[name="email"]',
      'select[name="serviceType"]',
      'textarea[name="description"]',
      'input[name="measurements"]',
      'input[name="privacy"]',
    ]) {
      expect(d.querySelector(sel), sel).not.toBeNull();
    }
  });

  test('ogni campo ha la sua label', () => {
    const campi = [
      ...d.querySelectorAll(
        'input[id]:not([type="hidden"]):not([id="website"]), select[id], textarea[id]'
      ),
    ];
    expect(campi.length).toBeGreaterThan(0);
    const senzaLabel = campi.filter((c) => !d.querySelector(`label[for="${c.id}"]`));
    expect(senzaLabel.map((c) => c.id)).toEqual([]);
  });

  // Un aria-describedby verso un id che non c'e' non lega niente: il lettore di schermo non
  // annunciava l'errore di tipo di lavoro, descrizione e misure; la privacy non era collegata.
  test('ogni campo punta al suo messaggio di errore', () => {
    for (const campo of [
      'name',
      'phone',
      'email',
      'serviceType',
      'description',
      'measurements',
      'privacy',
    ]) {
      const id = d.querySelector(`#quote-form [name="${campo}"]`)!.getAttribute('aria-describedby');
      expect(id, campo).toBeTruthy();
      expect(d.getElementById(id!)?.getAttribute('data-error'), campo).toBe(campo);
    }
  });

  // Il messaggio lo legge il focus sul campo (aria-describedby): con role="alert" su ognuno,
  // un invio vuoto annunciava tutti gli errori insieme mentre il focus si spostava.
  test('i messaggi dei campi non sono regioni live', () => {
    const live = [...d.querySelectorAll('[data-error]')].filter(
      (p) => p.hasAttribute('role') || p.hasAttribute('aria-live')
    );
    expect(live.map((p) => p.getAttribute('data-error'))).toEqual([]);
  });

  test("l'honeypot è nascosto ai lettori di schermo e fuori dal tab", () => {
    const honeypot = d.querySelector('input[name="website"]')!;
    expect(honeypot.parentElement?.getAttribute('aria-hidden')).toBe('true');
    expect(honeypot.getAttribute('tabindex')).toBe('-1');
    expect(honeypot.getAttribute('autocomplete')).toBe('off');
  });

  test('la privacy non è spuntata in partenza', () => {
    expect(d.querySelector('input[name="privacy"]')!.hasAttribute('checked')).toBe(false);
  });
});
