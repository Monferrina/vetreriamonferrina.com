import type { QuoteFormData, ValidationError } from './validation';

// Action del widget Turnstile, confrontata dal server (src/lib/turnstile.ts). Vive qui, nel
// modulo già condiviso con il browser, così lo script del form non importa il modulo di
// siteverify, che deve poter usare API di Node.
export const TURNSTILE_ACTION = 'send-quote';

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
// e il 503 JSON (Turnstile non disponibile) li ha gia' segnalati il server (send-quote.ts), e due
// eventi dividerebbero lo stesso guasto. Il 403 JSON di Turnstile si segnala: misura i falsi positivi.
export async function submitQuote(
  data: QuoteFormData & { turnstileToken?: string },
  deps: SubmitDeps
): Promise<SubmitOutcome> {
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
  const segnalatoDalServer = (res.status === 500 || res.status === 503) && message !== null;
  if (res.status !== 429 && !segnalatoDalServer) {
    // "json" distingue il 403 di Turnstile (JSON dell'endpoint) dal 403 testuale del middleware
    // o dall'HTML di Cloudflare: altrimenti un ORIGIN_VERIFY_SECRET sbagliato sembrerebbe una
    // raffica di falsi positivi di Turnstile.
    deps.report(new Error(`send-quote HTTP ${res.status}${message !== null ? ' json' : ''}`));
  }
  return { kind: 'error', message: message ?? "Errore durante l'invio. Riprova." };
}
