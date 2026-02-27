import { test, expect } from '@playwright/test';

test.describe('Form preventivo', () => {
  test('mostra errori per campi vuoti', async ({ page }) => {
    await page.goto('/preventivo');
    await page.getByRole('button', { name: /invia/i }).click();
    // Should show validation errors
    await expect(page.locator('[data-error]').first()).toBeVisible();
  });

  test('pre-compila servizio da query param', async ({ page }) => {
    await page.goto('/preventivo?servizio=box-doccia');
    const select = page.locator('select[name="serviceType"]');
    await expect(select).toHaveValue('box-doccia');
  });

  test('honeypot e\' nascosto e non accessibile', async ({ page }) => {
    await page.goto('/preventivo');
    const honeypot = page.locator('input[name="website"]');
    await expect(honeypot).toBeHidden();
  });

  test('checkbox privacy non e\' pre-selezionata', async ({ page }) => {
    await page.goto('/preventivo');
    const checkbox = page.locator('input[name="privacy"]');
    await expect(checkbox).not.toBeChecked();
  });

  test('form ha tutti i campi richiesti', async ({ page }) => {
    await page.goto('/preventivo');
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="phone"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('select[name="serviceType"]')).toBeVisible();
    await expect(page.locator('textarea[name="description"]')).toBeVisible();
    await expect(page.locator('input[name="privacy"]')).toBeVisible();
  });

  test('pre-compila servizio parapetti da query param', async ({ page }) => {
    await page.goto('/preventivo?servizio=parapetti');
    const select = page.locator('select[name="serviceType"]');
    await expect(select).toHaveValue('parapetti');
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

  test('mostra errore privacy se non accettata', async ({ page }) => {
    await page.goto('/preventivo');
    await page.getByRole('button', { name: /invia/i }).click();
    await expect(page.locator('[data-error="privacy"]')).toBeVisible();
  });

  test('campo misure e\' visibile ma opzionale', async ({ page }) => {
    await page.goto('/preventivo');
    await expect(page.locator('input[name="measurements"]')).toBeVisible();
  });
});
