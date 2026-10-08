import { test, expect } from '@playwright/test';

// Seam B6 (Z1): il widget Turnstile c'è su /preventivo e il CSP non blocca niente. Non invia
// il form. Un widget che non compare lascia il pulsante spento per tutti i visitatori, e il
// check API in dryRun non lo vede (risponde prima di Turnstile).
test('Turnstile widget presente su /preventivo senza violazioni CSP', async ({ page }) => {
  const violazioni: string[] = [];
  page.on('console', (msg) => {
    // Stessa regex di tests/e2e/csp.spec.ts.
    if (/Content Security Policy|Refused to (execute|load|apply)/.test(msg.text())) {
      violazioni.push(msg.text());
    }
  });

  const response = await page.goto('/preventivo');
  expect(response?.status()).toBe(200);

  // Con appearance interaction-only l'iframe esiste anche se resta invisibile.
  await expect(page.locator('iframe[src*="challenges.cloudflare.com"]')).toBeAttached({
    timeout: 15_000,
  });
  expect(violazioni).toEqual([]);

  // Un build fatto fuori produzione e servito come produzione (sitekey vuota o di test della
  // doc, che iniziano con 1x/2x/3x) darebbe 403 a ogni visitatore con tutti i monitor verdi:
  // il check negativo si aspetta proprio un 403. Questo è l'unico monitor che lo vede.
  const sitekey = await page.locator('#turnstile').getAttribute('data-sitekey');
  expect(sitekey).toBeTruthy();
  expect(sitekey).not.toMatch(/^[123]x/);
});
