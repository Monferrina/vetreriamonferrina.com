import { TURNSTILE_ACTION } from './quote-submit';

// Verifica lato server del token Turnstile. Fonte: doc Cloudflare "Server-side validation" e
// "Testing", lette il 07/10/2026; misure B-7/B-8 del 07/10/2026 su siteverify.

// Valori pubblici della doc, non segreti. Il secret di test accetta qualunque token, e siteverify
// riporta hostname "example.com", nessuna action e metadata.result_with_testing_key: true
// (misurato 07/10/2026). Usati solo fuori produzione.
export const TURNSTILE_TEST_SITEKEY = '1x00000000000000000000AA';
export const TURNSTILE_TEST_SECRET = '1x0000000000000000000000000000000AA';

const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
// Doc: token di 2048 caratteri al massimo. Oltre, vuoto o non stringa: rifiuto senza rete.
const MAX_TOKEN_LENGTH = 2048;
// Durata massima della funzione Vercel: 300 s (misurata da Marco, 07/10/2026). 10 s più i 2 s del
// flush di Sentry ci stanno con margine. La doc dice solo "Set reasonable timeouts".
const TIMEOUT_MS = 10_000;
// Codici che chi chiama provoca con il proprio token: 403 senza Sentry, altrimenti un client
// potrebbe esaurire la quota del monitoraggio. Un token spazzatura dà invalid-input-response
// (misurato col secret di produzione); bad-request resta qui per prudenza.
const CLIENT_CODES = new Set([
  'missing-input-response',
  'invalid-input-response',
  'timeout-or-duplicate',
  'bad-request',
]);

export type TurnstileOutcome =
  { kind: 'ok' } | { kind: 'invalid' } | { kind: 'unavailable'; code: string };

export interface TurnstileConfig {
  secret: string;
  // Host atteso, solo con le chiavi vere. null con quelle di test: siteverify non riporta né
  // l'host della pagina né l'action (misurato), quindi non c'è niente da confrontare.
  hostname: string | null;
}

export async function verifyTurnstile(
  token: unknown,
  cfg: TurnstileConfig,
  fetchFn: typeof fetch = fetch
): Promise<TurnstileOutcome> {
  if (typeof token !== 'string' || token === '' || token.length > MAX_TOKEN_LENGTH) {
    return { kind: 'invalid' };
  }
  // Produzione senza segreto: 503 visibile, mai la chiave di test al suo posto.
  if (!cfg.secret) return { kind: 'unavailable', code: 'secret assente' };

  let outcome: {
    success?: unknown;
    hostname?: unknown;
    action?: unknown;
    metadata?: { result_with_testing_key?: unknown };
    'error-codes'?: unknown;
  };
  try {
    const res = await fetchFn(SITEVERIFY_URL, {
      method: 'POST',
      // URLSearchParams, non concatenazione: il token non può aggiungere parametri.
      body: new URLSearchParams({ secret: cfg.secret, response: token }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) return { kind: 'unavailable', code: `HTTP ${res.status}` };
    outcome = await res.json();
  } catch (err) {
    // Timeout, rete, JSON rotto: solo il nome, il messaggio potrebbe citare la richiesta.
    return { kind: 'unavailable', code: err instanceof Error ? err.name : 'errore' };
  }

  if (outcome?.success === true) {
    if (cfg.hostname === null) return { kind: 'ok' };
    // Il secret di test finito in produzione accetta qualunque token (misurato). Va controllato
    // prima dell'host: altrimenti "example.com" darebbe un 403 muto, mentre è un guasto di
    // configurazione che deve arrivare a Sentry come 503.
    if (outcome.metadata?.result_with_testing_key === true) {
      return { kind: 'unavailable', code: 'chiave di test in produzione' };
    }
    // Host o action diversi: token di un altro widget o di un'altra azione. Riga fissa, senza i
    // valori: un attaccante non deve poter scrivere nei log, e basta a contarli.
    if (outcome.hostname !== cfg.hostname || outcome.action !== TURNSTILE_ACTION) {
      console.warn('[turnstile] hostname o action non attesi');
      return { kind: 'invalid' };
    }
    return { kind: 'ok' };
  }
  const raw = outcome?.['error-codes'];
  const codes = Array.isArray(raw) ? raw.map(String) : [];
  if (codes.length > 0 && codes.every((c) => CLIENT_CODES.has(c))) {
    console.warn('[turnstile] token rifiutato:', codes.join(','));
    return { kind: 'invalid' };
  }
  return { kind: 'unavailable', code: codes.join(',') || 'risposta senza codici' };
}

// Un solo predicato per "produzione" (lo stesso di sendEmails in api/send-quote.ts): dove partono
// email vere si usano chiavi vere, dove si usano quelle di test non parte niente. In produzione
// senza secret il valore resta vuoto e verifyTurnstile risponde 503: mai la chiave di test al
// suo posto. L'hostname atteso viene da SITE_URL, la stessa fonte del controllo Origin.
export function turnstileServerConfig(
  production: boolean,
  secret: string | undefined,
  siteUrl: string
): TurnstileConfig {
  return production
    ? { secret: secret ?? '', hostname: new URL(siteUrl).hostname }
    : { secret: TURNSTILE_TEST_SECRET, hostname: null };
}

// Sitekey per la pagina prerenderizzata: scelta al build con lo stesso predicato.
export function turnstileSiteKey(production: boolean, siteKey: string | undefined): string {
  return production ? (siteKey ?? '') : TURNSTILE_TEST_SITEKEY;
}
