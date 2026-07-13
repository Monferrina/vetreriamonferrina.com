import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('home page ha tutte le sezioni', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-section="hero"]')).toBeVisible();
    await expect(page.locator('[data-section="services"]')).toBeVisible();
    await expect(page.locator('[data-section="stats"]')).toBeVisible();
    await expect(page.locator('[data-section="cta"]')).toBeVisible();
  });

  test('CTA preventivo porta alla pagina corretta', async ({ page }) => {
    await page.goto('/');
    // Timeout largo: in dev le pagine compilano on-demand e sotto worker
    // paralleli la navigazione può superare i 5s di default.
    await page
      .getByRole('link', { name: /richiedi preventivo/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/preventivo/, { timeout: 15000 });
  });

  test('link servizi porta alla pagina corretta', async ({ page }) => {
    await page.goto('/');
    await page
      .getByRole('link', { name: /scopri.*servizi/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/servizi/, { timeout: 15000 });
  });
});
