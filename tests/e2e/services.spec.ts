import { test, expect } from '@playwright/test';

test('pagina servizi mostra tutte le categorie', async ({ page }) => {
  await page.goto('/servizi');
  await expect(page.locator('h1')).toContainText(/servizi/i);
  // Category section headings (h2) — use exact match to avoid matching service card h3s like "Vetri blindati"
  await expect(page.getByRole('heading', { name: 'Installazioni', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Vetri', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Lavorazioni', exact: true })).toBeVisible();
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
