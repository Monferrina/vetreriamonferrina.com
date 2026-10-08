// Seam E (F1): gli invii falliti che il form intercetta arrivano a Sentry, senza dati del modulo
// (perche': src/lib/quote-submit.ts).
import { afterEach, describe, expect, it, vi } from 'vitest';
import { submitQuote } from '../../src/lib/quote-submit';
import { validBody as dati } from './send-quote-fixtures';

function risponde(status: number, body: string, contentType = 'application/json') {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(body, { status, headers: { 'Content-Type': contentType } }))
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('submitQuote', () => {
  it('un 503 non JSON va a Sentry con il solo stato', async () => {
    const report = vi.fn();
    risponde(503, '<html>', 'text/html');
    const esito = await submitQuote(dati, { report });
    expect(esito).toEqual({ kind: 'error', message: "Errore durante l'invio. Riprova." });
    expect(report).toHaveBeenCalledOnce();
    expect(report.mock.calls[0][0]).toEqual(new Error('send-quote HTTP 503'));
  });

  it('un 403 del middleware va a Sentry', async () => {
    const report = vi.fn();
    risponde(403, 'Forbidden', 'text/plain');
    await submitQuote(dati, { report });
    expect(report.mock.calls[0][0]).toEqual(new Error('send-quote HTTP 403'));
  });

  it('la rete giu va a Sentry', async () => {
    const report = vi.fn();
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('Failed to fetch');
      })
    );
    const esito = await submitQuote(dati, { report });
    expect(esito.kind).toBe('error');
    expect(report.mock.calls[0][0]).toEqual(new Error('send-quote rete'));
  });

  it('422 e 429 sono risposte attese: niente Sentry', async () => {
    const report = vi.fn();
    const errors = [{ field: 'description', message: 'Descrizione troppo corta' }];
    risponde(422, JSON.stringify({ errors }));
    expect(await submitQuote(dati, { report })).toEqual({ kind: 'fieldErrors', errors });
    risponde(429, JSON.stringify({ error: 'Troppe richieste. Riprova tra un minuto.' }));
    await submitQuote(dati, { report });
    expect(report).not.toHaveBeenCalled();
  });

  it('un invio riuscito non va a Sentry', async () => {
    const report = vi.fn();
    risponde(200, JSON.stringify({ success: true }));
    expect(await submitQuote(dati, { report })).toEqual({ kind: 'success' });
    expect(report).not.toHaveBeenCalled();
  });

  it("un 500 dell'endpoint non va a Sentry: lo ha gia' segnalato il server", async () => {
    const report = vi.fn();
    risponde(500, JSON.stringify({ error: 'Errore invio email. Riprova o chiamaci.' }));
    const esito = await submitQuote(dati, { report });
    expect(esito).toEqual({ kind: 'error', message: 'Errore invio email. Riprova o chiamaci.' });
    expect(report).not.toHaveBeenCalled();
  });

  // Seam B5 (Z1): il 503 JSON di Turnstile lo ha gia' segnalato il server; il 403 JSON
  // (token rifiutato) si segnala, per misurare i falsi positivi.
  it("un 503 JSON dell'endpoint non va a Sentry: lo ha gia' segnalato il server", async () => {
    const report = vi.fn();
    risponde(503, JSON.stringify({ error: 'Errore invio email. Riprova o chiamaci.' }));
    const esito = await submitQuote(dati, { report });
    expect(esito).toEqual({ kind: 'error', message: 'Errore invio email. Riprova o chiamaci.' });
    expect(report).not.toHaveBeenCalled();
  });

  it('un 403 JSON di Turnstile va a Sentry con il solo stato', async () => {
    const report = vi.fn();
    risponde(
      403,
      JSON.stringify({ error: 'Verifica anti-spam non riuscita. Riprova o chiamaci.' })
    );
    const esito = await submitQuote(dati, { report });
    expect(esito).toEqual({
      kind: 'error',
      message: 'Verifica anti-spam non riuscita. Riprova o chiamaci.',
    });
    expect(report.mock.calls[0][0]).toEqual(new Error('send-quote HTTP 403 json'));
  });

  it('un JSON senza la forma attesa e un errore del server', async () => {
    const report = vi.fn();
    risponde(502, 'null');
    expect(await submitQuote(dati, { report })).toEqual({
      kind: 'error',
      message: "Errore durante l'invio. Riprova.",
    });
    risponde(504, JSON.stringify({ error: { code: '504' } }));
    expect(await submitQuote(dati, { report })).toEqual({
      kind: 'error',
      message: "Errore durante l'invio. Riprova.",
    });
    expect(report).toHaveBeenCalledTimes(2);
  });

  it("l'errore per Sentry non contiene nome, email o telefono", async () => {
    const report = vi.fn();
    risponde(502, JSON.stringify({ error: 'x' }));
    await submitQuote(dati, { report });
    const testo = JSON.stringify(report.mock.calls, Object.getOwnPropertyNames(new Error()));
    for (const dato of [dati.name, dati.email, dati.phone]) expect(testo).not.toContain(dato);
  });
});
