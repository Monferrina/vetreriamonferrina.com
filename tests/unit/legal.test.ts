// @vitest-environment node
// Contenuti obbligatori di privacy e cookie policy: prima erano 9 E2E, ma leggevano solo
// il testo della pagina (T1, passo 3).
import { describe, expect, test } from 'vitest';
import { renderPage, text } from './render-page';
import Privacy from '../../src/pages/privacy.astro';
import Cookie from '../../src/pages/cookie.astro';
import NoteLegali from '../../src/pages/note-legali.astro';

describe('privacy policy', () => {
  test('titolare, GDPR, Sentry, Garante, diritti e link alla cookie policy', async () => {
    const d = await renderPage(Privacy, '/privacy');
    expect(text(d.querySelector('main h1'))).toMatch(/privacy/i);
    const main = text(d.querySelector('main'));
    for (const atteso of [
      'GDPR',
      'Fioravanti',
      'Sentry',
      'Garante per la Protezione dei Dati Personali',
      'garanteprivacy.it',
      'art. 15',
      'art. 16',
      'art. 17',
      'art. 18',
      'art. 20',
      'art. 21',
    ]) {
      expect(main, atteso).toContain(atteso);
    }
    expect(d.querySelector('main a[href="/cookie"]')).not.toBeNull();
  });
});

describe('cookie policy', () => {
  test('storage usati, base normativa e link alla privacy policy', async () => {
    const d = await renderPage(Cookie, '/cookie');
    expect(text(d.querySelector('main h1'))).toMatch(/cookie/i);
    const main = text(d.querySelector('main'));
    for (const atteso of [
      'sessionStorage',
      'localStorage',
      'cookie_notice_seen',
      'art. 122',
      'D.Lgs. 196/2003',
    ]) {
      expect(main, atteso).toContain(atteso);
    }
    expect(d.querySelector('main a[href="/privacy"]')).not.toBeNull();
  });
});

// NR1: dati della ditta per il d.lgs. 70/2003 art. 7 (REA, P.IVA), licenza del codice e la frase
// che i termini Google Maps Platform EEA §3.2.2 chiedono, con i due link.
describe('note legali', () => {
  test('REA, P.IVA, licenza Apache-2.0 e link richiesti da Google Maps', async () => {
    const d = await renderPage(NoteLegali, '/note-legali');
    const main = text(d.querySelector('main'));
    for (const atteso of ['AL-171335', '01574530067', 'Apache-2.0']) {
      expect(main, atteso).toContain(atteso);
    }
    expect(
      d.querySelector('main a[href="https://maps.google.com/help/terms_maps/"]')
    ).not.toBeNull();
    expect(d.querySelector('main a[href="https://policies.google.com/privacy"]')).not.toBeNull();
  });
});
