import type { APIContext } from 'astro';
import { Resend } from 'resend';
import { RESEND_API_KEY, RESEND_FROM_EMAIL, VETRERIA_EMAIL, SITE_URL } from 'astro:env/server';
import { handleSendQuote } from '../../lib/send-quote';

export const prerender = false;

export async function POST({ request, clientAddress }: APIContext) {
  const resend = new Resend(RESEND_API_KEY);

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
    },
    resend.emails
  );

  return new Response(JSON.stringify(result.body), {
    status: result.status,
    headers: { 'Content-Type': 'application/json' },
  });
}
