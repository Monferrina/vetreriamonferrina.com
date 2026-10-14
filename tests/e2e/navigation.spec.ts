import { test, expect } from './fixtures';

test.describe('Navigazione', () => {
  // AU1 (A10): il tema scuro era solo automatico (sistema scuro oppure dalle 20 alle 7) e non si
  // poteva cambiare. Col sistema chiaro a mezzogiorno il tema automatico è chiaro: la scelta
  // dell'interruttore deve restare anche dopo un ricaricamento.
  test("l'interruttore mette il tema scuro e la scelta resta dopo il ricaricamento", async ({
    page,
  }) => {
    await page.clock.setFixedTime(new Date('2026-10-13T12:00:00+02:00'));
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    const html = page.locator('html');
    await expect(html).not.toHaveAttribute('data-theme', 'dark');
    await page.getByRole('button', { name: 'Tema scuro' }).click();
    await expect(html).toHaveAttribute('data-theme', 'dark');
    await page.reload();
    await expect(html).toHaveAttribute('data-theme', 'dark');
  });

  // Skip a livello di gruppo: decide prima che Playwright apra la pagina.
  test.describe('desktop', () => {
    test.skip(({ isMobile }) => isMobile, 'solo nel progetto desktop');

    // I link della nav li verifica header.test.ts; qui conta solo quale nav si vede.
    test('su desktop si vede la nav e non la bottom nav', async ({ page }) => {
      await page.goto('/');
      await expect(page.getByRole('navigation', { name: 'Navigazione principale' })).toBeVisible();
      await expect(page.locator('[data-bottom-nav]')).toBeHidden();
    });
  });

  test.describe('mobile', () => {
    test.skip(({ isMobile }) => !isMobile, 'solo nel progetto mobile');

    // La nav mobile è la BottomNav fissa in basso (il menu hamburger non esiste più).
    test('bottom nav mobile visibile con i tab principali', async ({ page }) => {
      await page.goto('/');
      await expect(page.getByRole('navigation', { name: 'Navigazione principale' })).toBeHidden();

      const bottomNav = page.locator('[data-bottom-nav]');
      await expect(bottomNav).toBeVisible();
      await expect(bottomNav.getByRole('link', { name: /servizi/i })).toBeVisible();
      await expect(bottomNav.getByRole('link', { name: /contatti/i })).toBeVisible();
    });

    test('bottom nav mobile naviga ai servizi', async ({ page }) => {
      await page.goto('/');

      await page
        .locator('[data-bottom-nav]')
        .getByRole('link', { name: /servizi/i })
        .click();
      await expect(page).toHaveURL(/\/servizi/, { timeout: 10000 });
    });

    // AU1: link alti 17-20 px su mobile ("Scopri di più", "Maggiori dettagli", briciola, footer),
    // sotto i 24 px di WCAG 2.5.8. Esclusi come nel criterio i link dentro una frase (genitore P)
    // e quello visibile solo da tastiera ("Vai al contenuto principale", sr-only).
    for (const path of ['/', '/servizi/box-doccia', '/faq']) {
      test(`link e pulsanti alti almeno 24 px in ${path}`, async ({ page }) => {
        await page.goto(path);
        const bassi = await page.evaluate(() =>
          [...document.querySelectorAll<HTMLElement>('a[href], button')]
            .filter((el) => {
              const r = el.getBoundingClientRect();
              const inFrase = el.parentElement?.tagName === 'P';
              return r.width > 1 && r.height > 1 && r.height < 24 && !inFrase;
            })
            .map(
              (el) =>
                `"${el.textContent?.trim()}" ${Math.round(el.getBoundingClientRect().height)}px`
            )
        );
        expect(bassi).toEqual([]);
      });
    }

    // AU1 (13/10/2026, video da iPhone 15 Pro, iOS 26): nel cambio pagina Safari disegna la pagina
    // nuova prima che giri lo script, e la bolla compariva come una riga di 2 px che poi si
    // allargava. La posizione iniziale deve venire dall'HTML: senza JavaScript la bolla sta già
    // sopra la voce attiva.
    test.describe('senza JavaScript', () => {
      test.use({ javaScriptEnabled: false });

      for (const path of ['/', '/galleria', '/contatti']) {
        test(`la bolla della bottom nav è già sulla voce attiva in ${path}`, async ({ page }) => {
          await page.goto(path);
          const nav = page.locator('[data-bottom-nav]');
          const bolla = await nav.locator('[data-nav-bubble]').boundingBox();
          const voce = await nav.locator('a[aria-current="page"]').boundingBox();
          expect(Math.abs(bolla!.x - voce!.x)).toBeLessThanOrEqual(1);
          expect(Math.abs(bolla!.width - voce!.width)).toBeLessThanOrEqual(1);
        });
      }
    });
  });
});
