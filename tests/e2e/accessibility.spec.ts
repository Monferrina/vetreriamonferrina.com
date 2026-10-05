import { test, expect } from '@playwright/test';

test('focus visibile su elementi interattivi', async ({ page, browserName: _browserName }) => {
  // Skip on mobile-like viewports where keyboard Tab may not work
  const viewport = page.viewportSize();
  if (viewport && viewport.width < 768) {
    test.skip();
    return;
  }
  await page.goto('/');
  await page.keyboard.press('Tab');
  const focused = page.locator(':focus');
  await expect(focused).toBeVisible();
});
