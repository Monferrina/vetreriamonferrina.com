import process from 'node:process';
import type { APIContext } from 'astro';
import { Resend } from 'resend';
import { RESEND_API_KEY, RESEND_FROM_EMAIL, VETRERIA_EMAIL, SITE_URL } from 'astro:env/server';
import { EMAIL_ERROR, handleSendQuote } from '../../lib/send-quote';
import { report } from '../../lib/sentry-report';
// L'init di Sentry: l'integrazione non lo porta negli endpoint (astro.config.mjs).
import '../../../sentry.server.config';

export const prerender = false;

// Ogni errore non previsto del gestore arriva a Sentry e al visitatore torna il 500 JSON del
// form, non la pagina d'errore di Astro. Anche la lettura di clientAddress sta qui dentro:
// fuori da una richiesta Vercel l'adapter lancia ClientAddressNotAvailable.
export async function POST(context: APIContext) {
  try {
    return await handle(context);
  } catch (err) {
    console.error('[send-quote] Unexpected error:', err);
    await report(err);
    return new Response(JSON.stringify({ error: EMAIL_ERROR }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function handle({ request, clientAddress }: APIContext) {
  const siteUrl = (SITE_URL || '').trim();
  const allowedOrigins = [
    siteUrl,
    ...(import.meta.env.DEV ? ['http://localhost:4321', 'http://localhost:3000'] : []),
  ].filter(Boolean);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Dati non validi' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const result = await handleSendQuote(
    {
      origin: request.headers.get('origin'),
      // Behind Cloudflare, CF-Connecting-IP is the true visitor IP: a client that sends its
      // own cf-connecting-ip gets 403 "error code: 1000" from Cloudflare itself (measured
      // 2026-10-06, 7 POSTs via vetreriamonferrina.com; the docs do not state it). On the
      // direct Vercel path the middleware rejects requests without x-origin-verify (M1), so
      // the header is forgeable only by whoever holds both secrets. Prefer it so the rate
      // limit keys per real visitor, not per CF IP.
      ip:
        request.headers.get('cf-connecting-ip') ||
        clientAddress ||
        request.headers.get('x-forwarded-for') ||
        'unknown',
      body,
    },
    {
      allowedOrigins,
      resendApiKey: RESEND_API_KEY ?? '',
      fromEmail: RESEND_FROM_EMAIL ?? '',
      toEmail: VETRERIA_EMAIL ?? '',
      // Stessa espressione di rate-limit.ts: senza VERCEL_ENV (variabili di sistema spente)
      // ripiega su NODE_ENV, così in produzione l'email parte invece di sparire in silenzio.
      sendEmails: (process.env.VERCEL_ENV || process.env.NODE_ENV) === 'production',
    },
    // Client costruito solo all'invio: senza chiave il costruttore lancia, e costruito
    // qui in cima dava 500 a ogni richiesta, prima del controllo Origin (dev, preview).
    { send: (params) => new Resend(RESEND_API_KEY).emails.send(params) }
  );

  return new Response(JSON.stringify(result.body), {
    status: result.status,
    headers: { 'Content-Type': 'application/json' },
  });
}
