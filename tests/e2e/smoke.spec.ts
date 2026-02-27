import { test, expect } from '@playwright/test';

test.describe('Smoke E2E', () => {
  test('la home page carica', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Vetreria Monferrina/);
    await expect(page.locator('h1')).toContainText('Vetreria Monferrina');
  });

  test('il tag lang e italiano', async ({ page }) => {
    await page.goto('/');
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).toBe('it');
  });
});
