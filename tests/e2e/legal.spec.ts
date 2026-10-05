import { test, expect } from '@playwright/test';

// Opt-out dallo storageState globale: il test verifica il banner cookie al primo
// accesso, quindi parte con localStorage vuoto.
test.use({ storageState: { cookies: [], origins: [] } });

test('cookie banner appare, si chiude e non riappare dopo il reload', async ({ page }) => {
  await page.goto('/');
  const banner = page.locator('[data-cookie-banner]');
  await expect(banner).toBeVisible();
  await banner.getByRole('button', { name: 'OK' }).click();
  await expect(banner).toBeHidden();
  await page.reload();
  await expect(banner).toBeHidden();
});
