import { test, expect } from '@playwright/test';

test('tutte le immagini hanno alt text', async ({ page }) => {
  const pagesToCheck = ['/', '/servizi', '/chi-siamo', '/galleria'];
  for (const path of pagesToCheck) {
    await page.goto(path);
    const images = page.locator('main img');
    const count = await images.count();
    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute('alt');
      expect(alt, `${path}: immagine ${i} senza alt`).toBeTruthy();
    }
  }
});

test('focus visibile su elementi interattivi', async ({ page, browserName }) => {
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

test('form preventivo ha label associate a tutti i campi', async ({ page }) => {
  await page.goto('/preventivo');
  const inputs = page.locator('input[id]:not([type="hidden"]):not([id="website"]), select[id], textarea[id]');
  const count = await inputs.count();
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i++) {
    const id = await inputs.nth(i).getAttribute('id');
    if (id) {
      const label = page.locator(`label[for="${id}"]`);
      const labelCount = await label.count();
      expect(labelCount, `Input #${id} senza label`).toBeGreaterThan(0);
    }
  }
});

test('heading hierarchy e corretta (h1 unico per pagina)', async ({ page }) => {
  const pagesToCheck = ['/', '/servizi', '/chi-siamo', '/contatti', '/galleria', '/preventivo'];
  for (const path of pagesToCheck) {
    await page.goto(path);
    // Scope to main to avoid Astro dev toolbar injected headings
    const h1Count = await page.locator('main h1').count();
    expect(h1Count, `${path}: deve avere esattamente un h1 dentro main`).toBe(1);
  }
});

test('link hanno testo o aria-label', async ({ page }) => {
  await page.goto('/');
  // Scope to main + header + footer to avoid Astro dev toolbar links
  const links = page.locator('header a, main a, footer a');
  const count = await links.count();
  for (let i = 0; i < count; i++) {
    const link = links.nth(i);
    const text = await link.textContent();
    const ariaLabel = await link.getAttribute('aria-label');
    const title = await link.getAttribute('title');
    const hasText = text && text.trim().length > 0;
    const hasAriaLabel = ariaLabel && ariaLabel.trim().length > 0;
    const hasTitle = title && title.trim().length > 0;
    // Check if link contains an image with alt text
    const imgCount = await link.locator('img').count();
    let hasImgAlt = false;
    if (imgCount > 0) {
      const imgAlt = await link.locator('img').first().getAttribute('alt');
      hasImgAlt = !!(imgAlt && imgAlt.trim().length > 0);
    }
    const href = await link.getAttribute('href');
    expect(
      hasText || hasAriaLabel || hasTitle || hasImgAlt,
      `Link ${i} senza testo accessibile (href: ${href})`
    ).toBeTruthy();
  }
});
