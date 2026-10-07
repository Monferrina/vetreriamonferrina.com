import type { QuoteFormData, ValidationError } from './validation';

export type SubmitOutcome =
  | { kind: 'success' }
  | { kind: 'fieldErrors'; errors: ValidationError[] }
  | { kind: 'error'; message: string };

export interface SubmitDeps {
  // Sentry.captureException nel browser. Riceve solo errori costruiti qui, con lo stato HTTP:
  // nessun dato del modulo (regola di src/lib/sentry-options.ts).
  report: (err: Error) => void;
}

// Invio del form preventivi. Gli invii falliti che il form intercetta vanno a Sentry: il server
// non vede un 403 del middleware, l'HTML di Cloudflare, un 504 di Vercel o la rete giu'.
// 422 (campi) e 429 (rate limit) sono risposte attese e restano fuori; il 500 JSON dell'endpoint
// lo ha gia' segnalato il server (send-quote.ts), e due eventi dividerebbero lo stesso guasto.
export async function submitQuote(data: QuoteFormData, deps: SubmitDeps): Promise<SubmitOutcome> {
  let res: Response;
  try {
    res = await fetch('/api/send-quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch {
    deps.report(new Error('send-quote rete'));
    return { kind: 'error', message: 'Errore di rete. Controlla la connessione e riprova.' };
  }

  // json() rifiuta un corpo non JSON (MDN): un 403 testuale, l'HTML di Cloudflare o un 504
  // finivano come "Errore di rete". Qui diventano l'errore generico del server.
  // Anche un JSON valido puo' non avere la forma attesa (null, error come oggetto da un proxy).
  const json: { success?: unknown; errors?: unknown; error?: unknown } =
    (await res.json().catch(() => null)) ?? {};
  if (res.ok && json.success === true) return { kind: 'success' };
  if (Array.isArray(json.errors)) {
    return { kind: 'fieldErrors', errors: json.errors as ValidationError[] };
  }
  const message = typeof json.error === 'string' ? json.error : null;
  const segnalatoDalServer = res.status === 500 && message !== null;
  if (res.status !== 429 && !segnalatoDalServer) {
    deps.report(new Error(`send-quote HTTP ${res.status}`));
  }
  return { kind: 'error', message: message ?? "Errore durante l'invio. Riprova." };
}
