import { test, expect } from '@playwright/test';

test.describe('Navigazione', () => {
  test('navigazione desktop funziona', async ({ page, browserName: _browserName }) => {
    // Skip on mobile project — desktop nav is hidden at mobile viewport
    const viewport = page.viewportSize();
    if (viewport && viewport.width < 768) {
      test.skip();
    }

    await page.goto('/');
    const nav = page.locator('nav[aria-label="Navigazione principale"]');
    await expect(nav).toBeVisible();
    await expect(nav.getByRole('link', { name: /servizi/i })).toBeVisible();
    await expect(nav.getByRole('link', { name: /chi siamo/i })).toBeVisible();
    await expect(nav.getByRole('link', { name: /galleria/i })).toBeVisible();
    await expect(nav.getByRole('link', { name: /contatti/i })).toBeVisible();
    await expect(nav.getByRole('link', { name: /preventivo/i })).toBeVisible();
  });

  test('header e visibile e sticky', async ({ page }) => {
    await page.goto('/');
    const header = page.locator('header');
    await expect(header).toBeVisible();
    await expect(header).toHaveCSS('position', 'sticky');
  });

  test('footer contiene dati legali', async ({ page }) => {
    await page.goto('/');
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    await expect(footer).toContainText('Vetreria Monferrina di Fioravanti Giuseppe');
    await expect(footer).toContainText('P.IVA');
    await expect(footer).toContainText('Privacy Policy');
    await expect(footer).toContainText('Cookie Policy');
  });

  // La nav mobile è la BottomNav fissa in basso (il menu hamburger non esiste più).
  test('bottom nav mobile visibile con i tab principali', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');

    // Desktop nav should be hidden on mobile
    const desktopNav = page.locator('nav[aria-label="Navigazione principale"]');
    await expect(desktopNav).toBeHidden();

    const bottomNav = page.locator('[data-bottom-nav]');
    await expect(bottomNav).toBeVisible();
    await expect(bottomNav.getByRole('link', { name: /servizi/i })).toBeVisible();
    await expect(bottomNav.getByRole('link', { name: /preventivo/i })).toBeVisible();
  });

  test('bottom nav mobile naviga ai servizi', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');

    await page
      .locator('[data-bottom-nav]')
      .getByRole('link', { name: /servizi/i })
      .click();
    await expect(page).toHaveURL(/\/servizi/, { timeout: 10000 });
  });

  test('bottom nav nascosta su desktop', async ({ page }) => {
    const viewport = page.viewportSize();
    if (viewport && viewport.width < 768) {
      test.skip();
    }
    await page.goto('/');
    await expect(page.locator('[data-bottom-nav]')).toBeHidden();
  });
});
