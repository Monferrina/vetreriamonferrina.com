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

test('contatti ha mappa Google (facade click-to-load)', async ({ page }) => {
  // Terzi simulati: si verifica il nostro iframe, non quello che disegna Google.
  await page.route('https://www.google.com/maps/**', (route) =>
    route.fulfill({ contentType: 'text/html', body: '<html></html>' })
  );
  await page.route('https://api.open-meteo.com/**', (route) => route.fulfill({ json: {} }));
  await page.goto('/contatti');
  // La mappa è dietro una facade: placeholder leggero, iframe solo al click (INP + GDPR)
  const facade = page.getByRole('button', { name: /carica la mappa interattiva/i });
  await expect(facade).toBeVisible();
  await facade.click();
  await expect(page.getByTitle(/mappa posizione/i)).toHaveAttribute(
    'src',
    /^https:\/\/www\.google\.com\/maps\/embed\/v1\/place\?/
  );
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

// La foto arrivava da cdn.sanity.io: ora la serve il sito con astro:assets, come
// galleria e servizi (/_image in dev, /_astro nel build), con srcset responsive.
test('chi-siamo mostra la foto di famiglia servita dal sito', async ({ page }) => {
  await page.goto('/chi-siamo');
  const foto = page.getByAltText(/famiglia fioravanti/i).first();
  await expect(foto).toBeVisible();
  await expect(foto).toHaveAttribute('src', /^\/_(astro|image)/);
  await expect(foto).toHaveAttribute('srcset', /\S/);
});

// --- Galleria page ---

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

test('galleria lightbox si apre al click e si chiude con ESC', async ({ page }) => {
  await page.goto('/galleria');

  // Click on the first gallery item
  await page.locator('[data-gallery-item]').first().click();

  const lightbox = page.getByRole('dialog', { name: 'Visualizzatore immagini' });
  await expect(lightbox).toBeVisible();

  // Title should be shown
  const title = page.locator('[data-lightbox-title]');
  await expect(title).not.toBeEmpty();

  // Press Escape to close
  await page.keyboard.press('Escape');
  await expect(lightbox).toBeHidden();
});

test('galleria lightbox navigazione frecce', async ({ page }) => {
  // Le frecce sono hidden sotto sm (640px): su mobile si naviga con lo swipe
  const viewport = page.viewportSize();
  if (viewport && viewport.width < 640) {
    test.skip();
  }
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
