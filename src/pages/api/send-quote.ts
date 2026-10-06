import process from 'node:process';
import type { APIContext } from 'astro';
import { Resend } from 'resend';
import { RESEND_API_KEY, RESEND_FROM_EMAIL, VETRERIA_EMAIL, SITE_URL } from 'astro:env/server';
import { handleSendQuote } from '../../lib/send-quote';

export const prerender = false;

export async function POST({ request, clientAddress }: APIContext) {
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
      // Behind Cloudflare, CF-Connecting-IP is the true visitor IP (CF sets it, unspoofable
      // on the proxied path). Prefer it so the rate limit keys per real visitor, not per CF IP.
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
