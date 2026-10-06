import * as Sentry from '@sentry/astro';

// Flush prima di rispondere: la funzione Vercel può fermarsi appena la risposta è partita,
// e senza il middleware dell'integrazione (spento, astro.config.mjs) nessuno lo fa al posto nostro.
export async function report(err: unknown): Promise<void> {
  Sentry.captureException(err);
  await Sentry.flush(2000);
}
