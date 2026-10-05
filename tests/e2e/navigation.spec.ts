import { test, expect } from './fixtures';

test.describe('Navigazione', () => {
  // Skip a livello di gruppo: decide prima che Playwright apra la pagina.
  test.describe('desktop', () => {
    test.skip(({ isMobile }) => isMobile, 'solo nel progetto desktop');

    // I link della nav li verifica header.test.ts; qui conta solo quale nav si vede.
    test('su desktop si vede la nav e non la bottom nav', async ({ page }) => {
      await page.goto('/');
      await expect(page.getByRole('navigation', { name: 'Navigazione principale' })).toBeVisible();
      await expect(page.locator('[data-bottom-nav]')).toBeHidden();
    });
  });

  test.describe('mobile', () => {
    test.skip(({ isMobile }) => !isMobile, 'solo nel progetto mobile');

    // La nav mobile è la BottomNav fissa in basso (il menu hamburger non esiste più).
    test('bottom nav mobile visibile con i tab principali', async ({ page }) => {
      await page.goto('/');
      await expect(page.getByRole('navigation', { name: 'Navigazione principale' })).toBeHidden();

      const bottomNav = page.locator('[data-bottom-nav]');
      await expect(bottomNav).toBeVisible();
      await expect(bottomNav.getByRole('link', { name: /servizi/i })).toBeVisible();
      await expect(bottomNav.getByRole('link', { name: /preventivo/i })).toBeVisible();
    });

    test('bottom nav mobile naviga ai servizi', async ({ page }) => {
      await page.goto('/');

      await page
        .locator('[data-bottom-nav]')
        .getByRole('link', { name: /servizi/i })
        .click();
      await expect(page).toHaveURL(/\/servizi/, { timeout: 10000 });
    });
  });
});
