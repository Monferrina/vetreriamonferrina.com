import { test, expect } from '@playwright/test';

test("privacy policy e' accessibile e contiene GDPR", async ({ page }) => {
  await page.goto('/privacy');
  await expect(page.locator('main h1')).toContainText(/privacy/i);
  const text = await page.textContent('main');
  expect(text).toContain('GDPR');
  expect(text).toContain('Fioravanti');
});

test('privacy policy menziona Resend come processore dati', async ({ page }) => {
  await page.goto('/privacy');
  const text = await page.textContent('main');
  expect(text).toContain('Resend');
});

test('privacy policy menziona il Garante', async ({ page }) => {
  await page.goto('/privacy');
  const text = await page.textContent('main');
  expect(text).toContain('Garante per la Protezione dei Dati Personali');
  expect(text).toContain('garanteprivacy.it');
});

test('privacy policy elenca i diritti GDPR', async ({ page }) => {
  await page.goto('/privacy');
  const text = await page.textContent('main');
  expect(text).toContain('art. 15');
  expect(text).toContain('art. 16');
  expect(text).toContain('art. 17');
  expect(text).toContain('art. 18');
  expect(text).toContain('art. 20');
  expect(text).toContain('art. 21');
});

test('privacy policy ha link alla cookie policy', async ({ page }) => {
  await page.goto('/privacy');
  await expect(page.locator('main a[href="/cookie"]')).toBeVisible();
});

test("cookie policy e' accessibile", async ({ page }) => {
  await page.goto('/cookie');
  await expect(page.locator('main h1')).toContainText(/cookie/i);
  const text = await page.textContent('main');
  expect(text).toContain('sessionStorage');
});

test('cookie policy menziona localStorage', async ({ page }) => {
  await page.goto('/cookie');
  const text = await page.textContent('main');
  expect(text).toContain('localStorage');
  expect(text).toContain('cookie_notice_seen');
});

test('cookie policy ha base normativa art. 122', async ({ page }) => {
  await page.goto('/cookie');
  const text = await page.textContent('main');
  expect(text).toContain('art. 122');
  expect(text).toContain('D.Lgs. 196/2003');
});

test('cookie policy ha link alla privacy policy', async ({ page }) => {
  await page.goto('/cookie');
  await expect(page.locator('main a[href="/privacy"]')).toBeVisible();
});

test('cookie banner appare e si chiude', async ({ page }) => {
  await page.goto('/');
  const banner = page.locator('[data-cookie-banner]');
  await expect(banner).toBeVisible();
  // Dismiss the cookie banner — use dispatchEvent to avoid interception by Astro dev toolbar
  await page.locator('#cookie-banner-dismiss').dispatchEvent('click');
  await expect(banner).toBeHidden({ timeout: 2000 });
});

test('cookie banner non riappare dopo chiusura', async ({ page }) => {
  await page.goto('/');
  // Dismiss the cookie banner
  await page.locator('#cookie-banner-dismiss').dispatchEvent('click');
  await expect(page.locator('[data-cookie-banner]')).toBeHidden({ timeout: 2000 });
  await page.reload();
  await expect(page.locator('[data-cookie-banner]')).toBeHidden();
});

test('footer ha link privacy e cookie policy', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('footer a[href="/privacy"]')).toBeVisible();
  await expect(page.locator('footer a[href="/cookie"]')).toBeVisible();
});
