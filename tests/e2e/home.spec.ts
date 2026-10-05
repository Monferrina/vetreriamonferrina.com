import { test, expect } from './fixtures';

test.describe('Home Page', () => {
  test('CTA preventivo porta alla pagina corretta', async ({ page }) => {
    await page.goto('/');
    // Timeout largo: in dev le pagine compilano on-demand e sotto worker
    // paralleli la navigazione può superare i 5s di default.
    await page
      .getByRole('link', { name: /richiedi preventivo/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/preventivo/, { timeout: 15000 });
  });
});
