import { test, expect } from './fixtures';

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

// AU1: su mobile banner cookie, barra in basso e pulsante della chat coprivano ~380 px dei primi
// 844, e il pulsante della chat finiva dietro il banner. Finché il banner è aperto la chat non si
// mostra; dopo "OK" torna.
test('con il banner cookie aperto il pulsante della chat non si vede, dopo OK sì', async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, 'solo nel progetto mobile');
  await page.goto('/');
  const banner = page.locator('[data-cookie-banner]');
  const chat = page.locator('#chatbot-toggle');
  await expect(banner).toBeVisible();
  await expect(chat).toBeHidden();
  await banner.getByRole('button', { name: 'OK' }).click();
  await expect(banner).toBeHidden();
  await expect(chat).toBeVisible();
});
