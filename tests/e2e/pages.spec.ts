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

test('contatti ha mappa Google', async ({ page }) => {
  await page.goto('/contatti');
  const mapIframe = page.locator('iframe[src*="google.com/maps"]');
  await expect(mapIframe).toBeVisible();
});

test('contatti ha orari di apertura', async ({ page }) => {
  await page.goto('/contatti');
  await expect(page.getByText(/8:00.*12:00/).first()).toBeVisible();
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
  // Values section heading cards use accented Italian: Artigianalità, Qualità, Territorio
  await expect(page.getByRole('heading', { name: /artigianali/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /qualit/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /territorio/i })).toBeVisible();
});

test('chi-siamo ha foto o placeholder famiglia', async ({ page }) => {
  await page.goto('/chi-siamo');
  const foto = page.getByAltText(/famiglia fioravanti/i).first();
  const placeholder = page.getByText(/foto.*famiglia.*in arrivo/i).first();
  const hasFoto = await foto.isVisible().catch(() => false);
  const hasPlaceholder = await placeholder.isVisible().catch(() => false);
  expect(hasFoto || hasPlaceholder).toBeTruthy();
});

test('chi-siamo ha timeline con milestone', async ({ page }) => {
  await page.goto('/chi-siamo');
  await expect(page.getByText(/le origini/i)).toBeVisible();
  await expect(page.getByText(/la crescita/i)).toBeVisible();
  await expect(page.getByText(/la famiglia si allarga/i)).toBeVisible();
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

  // Wait for filter animation to complete — items get display:none after 200ms animation
  const installazioniItems = page.locator('[data-gallery-item][data-category="installazioni"]');
  const nonInstallazioniItems = page.locator(
    '[data-gallery-item]:not([data-category="installazioni"])'
  );

  // Use auto-retrying assertion: non-matching items should become hidden
  await expect(nonInstallazioniItems.first()).toBeHidden({ timeout: 5000 });

  // Verify all installazioni items are still visible
  const installazioniCount = await installazioniItems.count();
  expect(installazioniCount).toBeGreaterThan(0);
  for (let i = 0; i < installazioniCount; i++) {
    await expect(installazioniItems.nth(i)).toBeVisible();
  }

  // Click "Tutti" to reset — all items should reappear
  await page.locator('[data-filter="tutti"]').click();
  await expect(allItems.first()).toBeVisible();
  await expect(allItems.last()).toBeVisible();
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

  // Open lightbox on first item
  await page.locator('[data-gallery-item]').first().click();
  const title = page.locator('[data-lightbox-title]');
  await expect(title).not.toBeEmpty();
  const firstTitle = await title.textContent();

  // Click next — content updates with a 200ms crossfade animation
  await page.locator('[data-lightbox-next]').click();
  // Use auto-retrying assertion to wait for title change
  await expect(title).not.toHaveText(firstTitle!, { timeout: 2000 });

  // Click prev to go back
  await page.locator('[data-lightbox-prev]').click();
  await expect(title).toHaveText(firstTitle!, { timeout: 2000 });

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
