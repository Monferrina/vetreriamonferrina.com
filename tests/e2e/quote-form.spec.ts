import type { Page } from '@playwright/test';
import { test, expect } from './fixtures';

async function compila(page: Page) {
  await page.getByLabel(/nome e cognome/i).fill('Mario Rossi');
  await page.getByLabel(/telefono/i).fill('0142 123456');
  await page.getByLabel(/email/i).fill('mario.rossi@example.com');
  await page.getByLabel(/tipo di lavoro/i).selectOption('box-doccia');
  await page.getByLabel(/descrizione del lavoro/i).fill('Box doccia in nicchia con anta battente');
  await page.getByLabel(/misure approssimative/i).fill('120x80 cm');
  await page.getByLabel(/acconsento/i).check();
}

test.describe('Form preventivo', () => {
  // Seam S1: il percorso che porta il contatto, fino alla conferma. L'invio e' simulato:
  // l'API vera manda una email con Resend.
  test('invia il preventivo completo e mostra la conferma', async ({ page }) => {
    let inviato: unknown;
    await page.route('**/api/send-quote', async (route) => {
      inviato = route.request().postDataJSON();
      await route.fulfill({ json: { success: true } });
    });
    await page.goto('/preventivo');
    await compila(page);
    await page.getByRole('button', { name: /invia/i }).click();
    await expect(page.getByText('Richiesta inviata con successo!')).toBeVisible();
    expect(inviato).toEqual({
      name: 'Mario Rossi',
      phone: '0142 123456',
      email: 'mario.rossi@example.com',
      serviceType: 'box-doccia',
      description: 'Box doccia in nicchia con anta battente',
      measurements: '120x80 cm',
      privacy: true,
      honeypot: '',
    });
  });

  test("se il server risponde 500 mostra l'errore e non la conferma", async ({ page }) => {
    await page.route('**/api/send-quote', (route) =>
      route.fulfill({ status: 500, json: { error: 'Errore invio email' } })
    );
    await page.goto('/preventivo');
    await compila(page);
    await page.getByRole('button', { name: /invia/i }).click();
    await expect(page.getByText('Errore invio email')).toBeVisible();
    await expect(page.getByText('Richiesta inviata con successo!')).toBeHidden();
  });

  // Risposta non JSON: v. src/lib/quote-submit.ts.
  test("una risposta non JSON e' un errore del server, non di rete", async ({ page }) => {
    await page.route('**/api/send-quote', (route) =>
      route.fulfill({
        status: 503,
        contentType: 'text/html',
        body: '<html>Service Unavailable</html>',
      })
    );
    await page.goto('/preventivo');
    await compila(page);
    await page.getByRole('button', { name: /invia/i }).click();
    await expect(page.locator('#form-error-message')).toHaveText(
      "Errore durante l'invio. Riprova."
    );
  });

  // Il server valida dopo sanitize e puo' rispondere 422 su un campo che il browser aveva
  // accettato: senza focus l'errore restava lontano dal pulsante e sembrava non succedere niente.
  test('un 422 del server porta il focus sul campo in errore', async ({ page }) => {
    await page.route('**/api/send-quote', (route) =>
      route.fulfill({
        status: 422,
        json: { errors: [{ field: 'description', message: 'Descrizione troppo corta' }] },
      })
    );
    await page.goto('/preventivo');
    await compila(page);
    await page.getByRole('button', { name: /invia/i }).click();
    await expect(page.getByText('Descrizione troppo corta')).toBeVisible();
    await expect(page.getByLabel(/descrizione del lavoro/i)).toBeFocused();
  });

  test('i campi in errore sono marcati aria-invalid', async ({ page }) => {
    await page.goto('/preventivo');
    await page.getByLabel(/email/i).fill('mario.rossi@example.com');
    await page.getByRole('button', { name: /invia/i }).click();
    await expect(page.getByLabel(/nome e cognome/i)).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByLabel(/acconsento/i)).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByLabel(/email/i)).not.toHaveAttribute('aria-invalid', 'true');
  });

  test('mostra errori per campi vuoti', async ({ page }) => {
    await page.goto('/preventivo');
    await page.getByRole('button', { name: /invia/i }).click();
    await expect(page.getByText('Devi accettare la privacy policy')).toBeVisible();
  });

  test('pre-compila servizio da query param', async ({ page }) => {
    await page.goto('/preventivo?servizio=box-doccia');
    const select = page.locator('select[name="serviceType"]');
    await expect(select).toHaveValue('box-doccia');
  });

  test('query param invalido non seleziona nulla', async ({ page }) => {
    await page.goto('/preventivo?servizio=hacking');
    const select = page.locator('select[name="serviceType"]');
    await expect(select).toHaveValue('');
  });
});

// Seam F1: senza script il form non deve partire (perche': commento in testa a QuoteForm.astro).
test.describe('Form preventivo senza JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('non invia nulla e mostra i contatti', async ({ page }) => {
    await page.goto('/preventivo');
    await compila(page);
    await expect(page.getByRole('button', { name: /invia/i })).toBeDisabled();
    await expect(
      page.locator('#quote-form').getByRole('link', { name: '+39 0142 563728' })
    ).toBeVisible();
    // Invio da un campo: per WHATWG l'invio implicito clicca il pulsante solo se non e' disabled.
    // L'invio da Invio e' un task del browser: una navigazione arriverebbe ben prima di 500 ms.
    const inviata = page.waitForRequest((r) => r.isNavigationRequest(), { timeout: 500 });
    await page.getByLabel(/email/i).press('Enter');
    await expect(inviata).rejects.toThrow();
  });
});
