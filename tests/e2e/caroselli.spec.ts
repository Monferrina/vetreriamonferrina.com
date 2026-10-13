import { test, expect } from './fixtures';

// AU1: il carosello delle recensioni scorreva all'infinito e si fermava solo col mouse sopra
// (WCAG 2.2.2): da tastiera o da touch non c'era modo di fermarlo. Quello del laboratorio aveva
// già un pulsante; ora lo hanno tutti e due, con lo stesso codice.
test.skip(({ isMobile }) => isMobile, 'col Tab: solo nel progetto desktop');

for (const pagina of ['/', '/chi-siamo']) {
  test(`${pagina}: il carosello si ferma col pulsante, raggiunto col Tab`, async ({ page }) => {
    await page.goto(pagina);
    const pulsante = page.getByRole('button', { name: 'Metti in pausa il carosello' });
    await expect(pulsante).toHaveCount(1);
    let raggiunto = false;
    for (let i = 0; i < 80 && !raggiunto; i++) {
      await page.keyboard.press('Tab');
      raggiunto = await pulsante.evaluate((b) => b === document.activeElement);
    }
    expect(raggiunto).toBe(true);
    await page.keyboard.press('Enter');
    await expect(page.locator('.auto-carousel-track')).toHaveCSS('animation-play-state', 'paused');
    await expect(page.getByRole('button', { name: 'Riprendi il carosello' })).toHaveCount(1);
  });
}
