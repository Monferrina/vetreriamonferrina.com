import { test, expect } from '@playwright/test';

const publicPages = [
  '/',
  '/servizi',
  '/chi-siamo',
  '/contatti',
  '/galleria',
  '/preventivo',
  '/privacy',
  '/cookie',
];

test('ogni pagina ha meta description lunga almeno 50 caratteri', async ({ page }) => {
  for (const path of publicPages) {
    await page.goto(path);
    const desc = await page.locator('meta[name="description"]').getAttribute('content');
    expect(desc, `${path} manca meta description`).toBeTruthy();
    expect(desc!.length, `${path} description troppo corta`).toBeGreaterThanOrEqual(50);
  }
});

test('ogni pagina ha title univoco', async ({ page }) => {
  const titles: string[] = [];
  for (const path of publicPages) {
    await page.goto(path);
    const title = await page.title();
    expect(title, `${path} manca title`).toBeTruthy();
    expect(titles, `${path} title duplicato: "${title}"`).not.toContain(title);
    titles.push(title);
  }
});

test('ogni pagina ha canonical URL', async ({ page }) => {
  for (const path of publicPages) {
    await page.goto(path);
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical, `${path} manca canonical`).toBeTruthy();
  }
});

test('ogni pagina ha Open Graph tags', async ({ page }) => {
  for (const path of publicPages) {
    await page.goto(path);
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    expect(ogTitle, `${path} manca og:title`).toBeTruthy();
  }
});

test('robots.txt e accessibile', async ({ page }) => {
  const response = await page.goto('/robots.txt');
  expect(response!.status()).toBe(200);
  const text = await page.textContent('body');
  expect(text).toContain('Sitemap');
});

test('structured data JSON-LD presente', async ({ page }) => {
  await page.goto('/');
  const jsonLd = await page.locator('script[type="application/ld+json"]').textContent();
  expect(jsonLd).toContain('LocalBusiness');
  expect(jsonLd).toContain('Vetreria Monferrina');
  expect(jsonLd).toContain('Casale Monferrato');
});

test('lang="it" su tutte le pagine', async ({ page }) => {
  for (const path of publicPages) {
    await page.goto(path);
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang, `${path} manca lang`).toBe('it');
  }
});

test('favicon e collegato', async ({ page }) => {
  await page.goto('/');
  const favicon = page.locator('link[rel="icon"]');
  await expect(favicon).toHaveAttribute('href', '/favicon.svg');
});
