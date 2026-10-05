import { test, expect, type Page } from '@playwright/test';

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
