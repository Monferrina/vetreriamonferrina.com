import { test, expect } from './fixtures';

// Su mobile non c'è una tastiera con cui navigare col Tab.
test.skip(({ isMobile }) => isMobile, 'solo nel progetto desktop');

test('focus visibile su elementi interattivi', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  const focused = page.locator(':focus');
  await expect(focused).toBeVisible();
});
