import AxeBuilder from '@axe-core/playwright';
import { test, expect } from './fixtures';

// Su mobile non c'è una tastiera con cui navigare col Tab.
test.skip(({ isMobile }) => isMobile, 'solo nel progetto desktop');

test('focus visibile su elementi interattivi', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  const focused = page.locator(':focus');
  await expect(focused).toBeVisible();
});

// AU1 (13/10/2026): l'audit con axe ha trovato testo sotto 4,5:1 su 15 pagine, nei due temi
// (arancio del tema scuro, grigio neutral-500 del testo piccolo). Il tema dipende anche dall'ora
// (scuro dalle 20 alle 7): l'orologio fisso a mezzogiorno lascia decidere a colorScheme. Con
// "riduci movimento" le sezioni [data-reveal] sono visibili subito, senza aspettare lo scroll.
// La sitemap esiste solo nel build, come in csp.spec.
for (const colorScheme of ['light', 'dark'] as const) {
  test(`nessun testo sotto il contrasto AA su tutte le pagine, tema ${colorScheme}`, async ({
    page,
  }) => {
    test.skip(!process.env.BASE_URL, 'La sitemap esiste solo nel build');
    test.setTimeout(180_000);
    await page.clock.setFixedTime(new Date('2026-10-13T12:00:00+02:00'));
    await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' });
    const sitemap = await (await page.request.get('/sitemap-0.xml')).text();
    const paths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
    expect(paths.length).toBeGreaterThan(30);
    const violazioni: string[] = [];
    for (const path of paths) {
      await page.goto(path, { waitUntil: 'networkidle' });
      const { violations } = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze();
      for (const v of violations)
        for (const n of v.nodes) violazioni.push(`${path} ${n.target.join(' ')}`);
    }
    expect(violazioni).toEqual([]);
  });
}

// AU1: PageSpeed su mobile (Lighthouse, 412x823) dava 96 per il pulsante "Scopri i nostri
// servizi" della testata: axe leggeva come sfondo l'alone arancio sfocato e non il blu sotto
// (1,07:1; sui pixel è 9,73:1). Solo a questa larghezza l'alone finisce dietro il pulsante.
test('nessun testo sotto il contrasto AA nella home con la vista mobile di Lighthouse', async ({
  page,
}) => {
  await page.setViewportSize({ width: 412, height: 823 });
  await page.clock.setFixedTime(new Date('2026-10-13T12:00:00+02:00'));
  await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
  await page.goto('/', { waitUntil: 'networkidle' });
  const { violations } = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze();
  expect(violations.flatMap((v) => v.nodes.map((n) => n.target.join(' ')))).toEqual([]);
});

// AU1: senza una regola del sito il contorno di focus era quello del browser, e in WebKit a tema
// chiaro (#5b9be8 su #fafafa) restava a 2,76:1, sotto il 3:1 di WCAG 1.4.11 (misurato sui pixel).
// Colori attesi: --color-primary dei due temi in global.css (#1b4965 e #5ba3cc).
for (const [colorScheme, atteso] of [
  ['light', 'rgb(27, 73, 101)'],
  ['dark', 'rgb(91, 163, 204)'],
] as const) {
  test(`col Tab il link ha un contorno pieno nel colore primario, tema ${colorScheme}`, async ({
    page,
  }) => {
    await page.clock.setFixedTime(new Date('2026-10-13T12:00:00+02:00'));
    await page.emulateMedia({ colorScheme });
    await page.goto('/');
    // Primo Tab: il link "Vai al contenuto"; secondo: il logo nell'header.
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    const stile = await page.evaluate(() => {
      const s = getComputedStyle(document.activeElement!);
      return {
        tag: document.activeElement!.tagName,
        style: s.outlineStyle,
        width: parseFloat(s.outlineWidth),
        color: s.outlineColor,
      };
    });
    expect(stile.tag).toBe('A');
    expect(stile.style).toBe('solid');
    expect(stile.width).toBeGreaterThanOrEqual(2);
    expect(stile.color).toBe(atteso);
  });
}
