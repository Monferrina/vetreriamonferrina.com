import type { APIContext } from 'astro';
import { Resend } from 'resend';
import { handleSendQuote } from '../../lib/send-quote';

export const prerender = false;

export async function POST({ request, clientAddress }: APIContext) {
  const resend = new Resend(import.meta.env.RESEND_API_KEY);

  const siteUrl = (import.meta.env.SITE_URL || '').trim();
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
      ip: clientAddress || request.headers.get('x-forwarded-for') || 'unknown',
      body,
    },
    {
      allowedOrigins,
      resendApiKey: import.meta.env.RESEND_API_KEY,
      fromEmail: import.meta.env.RESEND_FROM_EMAIL,
      toEmail: import.meta.env.VETRERIA_EMAIL,
    },
    resend.emails
  );

  return new Response(JSON.stringify(result.body), {
    status: result.status,
    headers: { 'Content-Type': 'application/json' },
  });
}
