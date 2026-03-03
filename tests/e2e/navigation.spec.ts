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

  test('menu mobile si apre e chiude', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');

    // Desktop nav should be hidden on mobile
    const desktopNav = page.locator('nav[aria-label="Navigazione principale"]');
    await expect(desktopNav).toBeHidden();

    // Hamburger button should be visible
    const burger = page.getByRole('button', { name: /apri menu/i });
    await expect(burger).toBeVisible();

    // Open menu
    await burger.click();
    const mobileMenu = page.locator('[data-mobile-menu]');
    await expect(mobileMenu).toBeVisible();

    // Close menu
    const closeBtn = page.getByRole('button', { name: /chiudi menu/i });
    await closeBtn.click();

    // Wait for transition
    await page.waitForTimeout(400);
    await expect(mobileMenu).toBeHidden();
  });

  test('menu mobile si chiude cliccando overlay', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');

    const burger = page.getByRole('button', { name: /apri menu/i });
    await burger.click();

    const mobileMenu = page.locator('[data-mobile-menu]');
    await expect(mobileMenu).toBeVisible();

    // Click overlay to close
    const overlay = page.locator('[data-menu-overlay]');
    await overlay.click({ position: { x: 10, y: 10 } });

    await page.waitForTimeout(400);
    await expect(mobileMenu).toBeHidden();
  });
});
