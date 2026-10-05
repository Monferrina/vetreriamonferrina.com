import { test, expect } from './fixtures';

test.describe('Chatbot', () => {
  test('dal servizio scelto porta al form preventivo con il servizio selezionato', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /apri glassy/i }).click();
    const panel = page.getByRole('dialog', { name: 'Assistente virtuale' });
    await panel.getByRole('button', { name: /che lavori fate/i }).click();
    await panel.getByRole('button', { name: /installazioni/i }).click();
    await panel.getByRole('button', { name: /box doccia/i }).click();
    await panel.getByRole('button', { name: /richiedi preventivo/i }).click();
    await expect(page).toHaveURL(/\/preventivo\?servizio=box-doccia$/);
    await expect(page.getByLabel(/tipo di lavoro/i)).toHaveValue('box-doccia');
  });

  test('si chiude con il pulsante chiudi', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /apri glassy/i }).click();
    const panel = page.getByRole('dialog', { name: 'Assistente virtuale' });
    await expect(panel).toBeVisible();
    await panel.getByRole('button', { name: 'Chiudi Glassy', exact: true }).click();
    await expect(panel).toBeHidden();
  });

  test('si chiude con Escape', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /apri glassy/i }).click();
    const panel = page.getByRole('dialog', { name: 'Assistente virtuale' });
    await expect(panel).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(panel).toBeHidden();
  });

  test.describe('mobile', () => {
    // Skip a livello di gruppo: decide prima che Playwright apra la pagina.
    test.skip(({ isMobile }) => !isMobile, 'solo nel progetto mobile');

    test("e' responsive su mobile", async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: /apri glassy/i }).click();
      const panel = page.getByRole('dialog', { name: 'Assistente virtuale' });
      await expect(panel).toBeVisible();
      // expect.poll riprova finché lo slide-in (scale 0.95→1) non è finito: misurato a metà
      // animazione il pannello è largo ~356px.
      await expect
        .poll(async () => (await panel.boundingBox())?.width ?? 0)
        .toBeGreaterThanOrEqual(360);
    });
  });
});
