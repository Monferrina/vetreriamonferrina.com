import * as Sentry from '@sentry/astro';

// Flush prima di rispondere: la funzione Vercel può fermarsi appena la risposta è partita,
// e senza il middleware dell'integrazione (spento, astro.config.mjs) nessuno lo fa al posto nostro.
export async function report(err: unknown): Promise<void> {
  Sentry.captureException(err);
  await Sentry.flush(2000);
}

// Un evento ogni dieci minuti per chiave (Upstash giù, Turnstile non disponibile): ogni
// richiesta mandava un evento, e lo stesso flood che provoca il guasto consumava la quota di
// Sentry accecando gli allarmi veri (Resend). Il log resta a ogni richiesta.
// ponytail: tetto per istanza, N istanze calde → N eventi ogni 10 min; un contatore globale costerebbe una chiamata Upstash proprio quando Upstash è giù.
const REPORT_EVERY_MS = 10 * 60_000;
const lastReport = new Map<string, number>();

export async function reportThrottled(key: string, err: unknown): Promise<void> {
  const now = Date.now();
  if (now - (lastReport.get(key) ?? -Infinity) < REPORT_EVERY_MS) return;
  lastReport.set(key, now);
  await report(err);
}
