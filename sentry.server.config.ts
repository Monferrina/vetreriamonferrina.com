import process from 'node:process';
import * as Sentry from '@sentry/astro';
import { sentryOptions } from './src/lib/sentry-options';

// Chiave a parte, mai pubblicata: quella del browser sta nel bundle e chiunque può consumarla,
// e l'errore "email del preventivo non partita" non deve finire scartato insieme ai suoi eventi.
// Il DSN si legge da process.env (non astro:env/server) perché l'endpoint gira anche sotto Vitest.
// Stessa condizione di produzione di sendEmails in send-quote: dove partono le email vere,
// i loro errori arrivano a Sentry.
const production = (process.env.VERCEL_ENV || process.env.NODE_ENV) === 'production';
const dsn = process.env.SENTRY_SERVER_DSN;

// Senza DSN l'SDK resta muto e gli errori di invio si perdono in silenzio: deve urlare nei log.
if (production && !dsn) {
  console.error('[sentry] SENTRY_SERVER_DSN assente in produzione: errori del server non inviati.');
}

Sentry.init({ ...sentryOptions, dsn, enabled: production });
