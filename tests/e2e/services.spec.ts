import { test, expect } from '@playwright/test';

test('pagina servizi mostra tutte le categorie', async ({ page }) => {
  await page.goto('/servizi');
  await expect(page.locator('h1')).toContainText(/servizi/i);
  // Categories are now filter buttons, not section headings
  await expect(page.locator('[data-service-filter="installazioni"]')).toBeVisible();
  await expect(page.locator('[data-service-filter="vetri"]')).toBeVisible();
  await expect(page.locator('[data-service-filter="lavorazioni"]')).toBeVisible();
});

test('pagina servizi mostra i servizi specifici', async ({ page }) => {
  await page.goto('/servizi');
  await expect(page.getByRole('heading', { name: 'Box doccia' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Parapetti' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Specchi' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Molature' })).toBeVisible();
});

test('CTA preventivo ha il parametro servizio', async ({ page }) => {
  await page.goto('/servizi');
  const firstCta = page.locator('a[href*="/preventivo?servizio="]').first();
  await expect(firstCta).toBeVisible();
  const href = await firstCta.getAttribute('href');
  expect(href).toMatch(/\/preventivo\?servizio=[\w-]+/);
});
