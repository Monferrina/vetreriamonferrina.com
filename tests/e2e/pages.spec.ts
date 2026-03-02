import { test, expect } from '@playwright/test';

// Smoke test all three content pages
const pages = [
  { path: '/chi-siamo', title: /chi siamo/i },
  { path: '/contatti', title: /contatti/i },
  { path: '/galleria', title: /galleria/i },
];

for (const { path, title } of pages) {
  test(`${path} carica correttamente`, async ({ page }) => {
    await page.goto(path);
    // Scope to main to avoid Astro dev toolbar injected headings
    await expect(page.locator('main h1')).toContainText(title);
    // Use first() to avoid strict mode with Astro dev toolbar headers
    await expect(page.locator('header').first()).toBeVisible();
    await expect(page.locator('footer').first()).toBeVisible();
  });
}

// --- Contatti page ---

test('contatti ha link telefonico cliccabile', async ({ page }) => {
  await page.goto('/contatti');
  // Scope to main content to avoid matching footer tel link
  await expect(page.locator('main a[href^="tel:"]')).toBeVisible();
});

test('contatti ha link email cliccabile', async ({ page }) => {
  await page.goto('/contatti');
  await expect(page.locator('main a[href^="mailto:"]')).toBeVisible();
});

test('contatti ha mappa OpenStreetMap', async ({ page }) => {
  await page.goto('/contatti');
  const iframe = page.locator('iframe[title="Mappa posizione Vetreria Monferrina"]');
  await expect(iframe).toBeVisible();
  const src = await iframe.getAttribute('src');
  expect(src).toContain('openstreetmap.org');
});

test('contatti ha orari di apertura', async ({ page }) => {
  await page.goto('/contatti');
  await expect(page.getByText(/8:00.*12:00/)).toBeVisible();
  await expect(page.getByText(/chiuso/i).first()).toBeVisible();
});

test('contatti ha CTA preventivo', async ({ page }) => {
  await page.goto('/contatti');
  const cta = page.locator('main').getByRole('link', { name: /preventivo gratuito/i });
  await expect(cta).toBeVisible();
  await expect(cta).toHaveAttribute('href', '/preventivo');
});

// --- Chi siamo page ---

test('chi-siamo ha sezione valori', async ({ page }) => {
  await page.goto('/chi-siamo');
  await expect(page.getByText(/artigianalita/i).first()).toBeVisible();
  await expect(page.getByText(/qualita/i).first()).toBeVisible();
  await expect(page.getByText(/territorio/i).first()).toBeVisible();
});

test('chi-siamo ha placeholder foto', async ({ page }) => {
  await page.goto('/chi-siamo');
  await expect(page.getByText(/foto in arrivo/i).first()).toBeVisible();
});

test('chi-siamo ha timeline con milestone', async ({ page }) => {
  await page.goto('/chi-siamo');
  await expect(page.getByText(/le origini/i)).toBeVisible();
  await expect(page.getByText(/crescita e specializzazione/i)).toBeVisible();
  await expect(page.getByText(/tradizione e innovazione/i)).toBeVisible();
});

// --- Galleria page ---

test('galleria ha filtri categoria', async ({ page }) => {
  await page.goto('/galleria');
  await expect(page.locator('[data-filter]').first()).toBeVisible();
  await expect(page.locator('[data-filter="tutti"]')).toBeVisible();
  await expect(page.locator('[data-filter="installazioni"]')).toBeVisible();
  await expect(page.locator('[data-filter="vetri"]')).toBeVisible();
  await expect(page.locator('[data-filter="lavorazioni"]')).toBeVisible();
});

test('galleria filtro nasconde elementi non corrispondenti', async ({ page }) => {
  await page.goto('/galleria');

  // Initially all items visible
  const allItems = page.locator('[data-gallery-item]');
  const totalCount = await allItems.count();
  expect(totalCount).toBeGreaterThanOrEqual(6);

  // Click "Installazioni" filter
  await page.locator('[data-filter="installazioni"]').click();

  // Only installazioni items should be visible
  const visibleItems = page.locator('[data-gallery-item]:not([style*="display: none"])');
  const visibleCount = await visibleItems.count();
  expect(visibleCount).toBeGreaterThan(0);
  expect(visibleCount).toBeLessThan(totalCount);

  // All visible items should have the installazioni category
  for (let i = 0; i < visibleCount; i++) {
    const category = await visibleItems.nth(i).getAttribute('data-category');
    expect(category).toBe('installazioni');
  }

  // Click "Tutti" to reset
  await page.locator('[data-filter="tutti"]').click();
  const resetCount = await page
    .locator('[data-gallery-item]:not([style*="display: none"])')
    .count();
  expect(resetCount).toBe(totalCount);
});

test('galleria ha lightbox nascosto per default', async ({ page }) => {
  await page.goto('/galleria');
  const lightbox = page.locator('[data-lightbox]');
  await expect(lightbox).toHaveClass(/hidden/);
});

test('galleria lightbox si apre al click e si chiude con ESC', async ({ page }) => {
  await page.goto('/galleria');

  // Click on the first gallery item
  await page.locator('[data-gallery-item]').first().click();

  // Lightbox should be visible
  const lightbox = page.locator('[data-lightbox]');
  await expect(lightbox).not.toHaveClass(/hidden/);

  // Title should be shown
  const title = page.locator('[data-lightbox-title]');
  await expect(title).not.toBeEmpty();

  // Press Escape to close
  await page.keyboard.press('Escape');
  await expect(lightbox).toHaveClass(/hidden/);
});

test('galleria lightbox navigazione frecce', async ({ page }) => {
  await page.goto('/galleria');

  // Open lightbox
  await page.locator('[data-gallery-item]').first().click();
  const title = page.locator('[data-lightbox-title]');
  const firstTitle = await title.textContent();

  // Click next
  await page.locator('[data-lightbox-next]').click();
  const secondTitle = await title.textContent();
  expect(secondTitle).not.toBe(firstTitle);

  // Click prev to go back
  await page.locator('[data-lightbox-prev]').click();
  const backTitle = await title.textContent();
  expect(backTitle).toBe(firstTitle);

  // Close
  await page.locator('[data-lightbox-close]').click();
  await expect(page.locator('[data-lightbox]')).toHaveClass(/hidden/);
});

test('galleria filtro attivo ha stile evidenziato', async ({ page }) => {
  await page.goto('/galleria');

  // "Tutti" should be active initially
  const tuttiBtn = page.locator('[data-filter="tutti"]');
  await expect(tuttiBtn).toHaveAttribute('aria-pressed', 'true');

  // Click a different filter
  const vetriBtn = page.locator('[data-filter="vetri"]');
  await vetriBtn.click();
  await expect(vetriBtn).toHaveAttribute('aria-pressed', 'true');
  await expect(tuttiBtn).toHaveAttribute('aria-pressed', 'false');
});
