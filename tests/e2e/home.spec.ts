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
    await page
      .getByRole('link', { name: /richiedi preventivo/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/preventivo/);
  });

  test('link servizi porta alla pagina corretta', async ({ page }) => {
    await page.goto('/');
    await page
      .getByRole('link', { name: /scopri.*servizi/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/servizi/);
  });
});
