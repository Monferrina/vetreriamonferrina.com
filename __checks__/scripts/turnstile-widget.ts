import { test, expect } from '@playwright/test';

// Seam B6 (Z1): il widget Turnstile funziona su /preventivo e il CSP non blocca niente. Non invia
// il form. Un widget che non compare lascia il pulsante spento per tutti i visitatori, e il
// check API in dryRun non lo vede (risponde prima di Turnstile).
//
// Sulle PR gira sulla preview (checkly.yml, `-e PREVIEW_URL=…`): lì serve il bypass della Vercel
// Authentication, letto dalle variabili dell'account Checkly a runtime, mai scritto nella
// configurazione. Misurato l'08/10/2026 su una run fallita di proposito (sessione
// 01a11b2d-275a-72b5-82d7-121474305571): negli artefatti che Checkly conserva (video, trace,
// rete, log, JSON) il valore dell'header compare 0 volte, solo il suo nome. In produzione
// (deploy al merge) PREVIEW_URL non c'è.
const preview = process.env.PREVIEW_URL;
if (preview) {
  test.use({
    baseURL: preview,
    extraHTTPHeaders: {
      'x-vercel-protection-bypass': process.env.VERCEL_AUTOMATION_BYPASS_SECRET ?? '',
    },
  });
}

test('Turnstile widget funzionante su /preventivo senza violazioni CSP', async ({ page }) => {
  const violazioni: string[] = [];
  page.on('console', (msg) => {
    // Stessa regex di tests/e2e/csp.spec.ts. Il feedback script di vercel.live è la toolbar
    // della preview, non del sito.
    if (
      /Content Security Policy|Refused to (execute|load|apply)/.test(msg.text()) &&
      !msg.text().includes('vercel.live')
    ) {
      violazioni.push(msg.text());
    }
  });

  const response = await page.goto('/preventivo');
  expect(response?.status()).toBe(200);

  if (preview) {
    // Sitekey di test: il token arriva subito e il pulsante si accende (QuoteForm.astro), senza
    // che compaia nessun iframe (misurato sulla preview l'08/10/2026).
    await expect(page.locator('#submit-btn')).toBeEnabled({ timeout: 20_000 });
  } else {
    // Chiave vera: un browser headless come quello di Checkly riceve la sfida interattiva e
    // nessun token (misurato in produzione l'08/10/2026: widget visibile, 45 s senza token). È
    // Turnstile che fa il suo lavoro, quindi qui si pretende solo che il widget di Cloudflare sia
    // partito: il suo frame è nella pagina (dentro lo shadow DOM, lo vede page.frames()).
    await expect
      .poll(
        () => page.frames().some((f) => f.url().startsWith('https://challenges.cloudflare.com/')),
        {
          timeout: 20_000,
        }
      )
      .toBe(true);
  }
  expect(violazioni).toEqual([]);

  // Solo in produzione: un build fatto fuori produzione e servito come produzione (sitekey vuota
  // o di test della doc, che iniziano con 1x/2x/3x) darebbe 403 a ogni visitatore con tutti i
  // monitor verdi, perché il check negativo attende proprio un 403. Questo è l'unico che lo vede.
  if (!preview) {
    const sitekey = await page.locator('#turnstile').getAttribute('data-sitekey');
    expect(sitekey).toBeTruthy();
    expect(sitekey).not.toMatch(/^[123]x/);
  }
});
