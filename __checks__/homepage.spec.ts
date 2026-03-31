import { test, expect } from '@playwright/test';

test('Homepage loads correctly', async ({ page }) => {
  const response = await page.goto('/');
  expect(response?.status()).toBeLessThan(400);
  await expect(page).toHaveTitle(/Vetreria Monferrina/);
  await page.screenshot({ path: 'homepage.jpg' });
});
