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

// Il link con ?servizio= vive ormai solo nel flusso chatbot; la feature reale
// è la preselezione del servizio nel form → si testa quella direttamente.
test('?servizio= preseleziona il servizio nel form preventivo', async ({ page }) => {
  await page.goto('/preventivo?servizio=box-doccia');
  const select = page.locator('select[name="serviceType"]');
  await expect(select).toBeVisible();
  await expect(select).toHaveValue('box-doccia');
});

test('pagina servizio ha CTA verso il preventivo', async ({ page }) => {
  await page.goto('/servizi/box-doccia');
  await expect(page.locator('main a[href="/preventivo"]').first()).toBeVisible();
});
