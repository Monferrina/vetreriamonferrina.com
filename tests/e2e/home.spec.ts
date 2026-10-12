import { test, expect } from './fixtures';

test.describe('Home Page', () => {
  test('Contattaci porta ai contatti', async ({ page }) => {
    await page.goto('/');
    // Timeout largo: in dev le pagine compilano on-demand e sotto worker
    // paralleli la navigazione può superare i 5s di default.
    await page
      .locator('section[data-section="hero"]')
      .getByRole('link', { name: /^contattaci$/i })
      .click();
    await expect(page).toHaveURL(/\/contatti$/, { timeout: 15000 });
  });
});
