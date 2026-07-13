import { test, expect } from '@playwright/test';

test.describe('Chatbot', () => {
  test('si apre e mostra il messaggio di benvenuto', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /apri glassy/i }).click();
    await expect(page.locator('[data-chatbot-panel]')).toBeVisible();
    await expect(page.locator('[data-chatbot-message]').first()).toContainText('Ciao');
  });

  test('navigazione nei servizi funziona', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /apri glassy/i }).click();
    await page.getByText(/che lavori fate/i).click();
    await expect(page.locator('[data-chatbot-message]').last()).toContainText(/vetro/i);
  });

  test('si chiude con il pulsante chiudi', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /apri glassy/i }).click();
    await expect(page.locator('[data-chatbot-panel]')).toBeVisible();
    // Target the close button inside the panel (not the toggle button)
    await page.locator('#chatbot-close').click();
    await expect(page.locator('[data-chatbot-panel]')).toBeHidden();
  });

  test('si chiude con Escape', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /apri glassy/i }).click();
    await expect(page.locator('[data-chatbot-panel]')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-chatbot-panel]')).toBeHidden();
  });

  test("e' responsive su mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await page.getByRole('button', { name: /apri glassy/i }).click();
    const panel = page.locator('[data-chatbot-panel]');
    await expect(panel).toBeVisible();
    // Attendi la fine dello slide-in (scale 0.95→1) prima di misurare,
    // altrimenti il boundingBox cattura la larghezza scalata (~356px < 360).
    await panel.evaluate((el) => Promise.all(el.getAnimations().map((a) => a.finished)));
    const box = await panel.boundingBox();
    // On mobile the panel should be (near) full-width
    expect(box!.width).toBeGreaterThanOrEqual(360);
  });
});
