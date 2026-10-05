import { test, expect } from '@playwright/test';

test.describe('Form preventivo', () => {
  test('mostra errori per campi vuoti', async ({ page }) => {
    await page.goto('/preventivo');
    await page.getByRole('button', { name: /invia/i }).click();
    await expect(page.getByText('Devi accettare la privacy policy')).toBeVisible();
  });

  test('pre-compila servizio da query param', async ({ page }) => {
    await page.goto('/preventivo?servizio=box-doccia');
    const select = page.locator('select[name="serviceType"]');
    await expect(select).toHaveValue('box-doccia');
  });

  test('query param invalido non seleziona nulla', async ({ page }) => {
    await page.goto('/preventivo?servizio=hacking');
    const select = page.locator('select[name="serviceType"]');
    await expect(select).toHaveValue('');
  });

  test('mostra errore nome per input troppo corto', async ({ page }) => {
    await page.goto('/preventivo');
    await page.fill('input[name="name"]', 'A');
    await page.getByRole('button', { name: /invia/i }).click();
    await expect(page.locator('[data-error="name"]')).toBeVisible();
  });

  test('mostra errore email per formato invalido', async ({ page }) => {
    await page.goto('/preventivo');
    await page.fill('input[name="email"]', 'not-an-email');
    await page.getByRole('button', { name: /invia/i }).click();
    await expect(page.locator('[data-error="email"]')).toBeVisible();
  });
});
