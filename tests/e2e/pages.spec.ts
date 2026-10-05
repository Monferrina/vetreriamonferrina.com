import { test, expect } from './fixtures';

// --- Contatti page ---

test('contatti ha mappa Google (facade click-to-load)', async ({ page }) => {
  // Google è bloccato dalla fixture: si verifica il nostro iframe, non quello che disegna Google.
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

test('galleria lightbox navigazione frecce', async ({ page, isMobile }) => {
  test.skip(isMobile, 'frecce nascoste sotto sm (640px): su mobile si naviga con lo swipe');
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
  await expect(page.getByRole('dialog', { name: 'Visualizzatore immagini' })).toBeHidden();
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
