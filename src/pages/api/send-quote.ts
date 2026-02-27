import type { APIContext } from 'astro';
import { Resend } from 'resend';
import { validateQuoteForm, type QuoteFormData } from '../../lib/validation';
import { sanitizeFormData } from '../../lib/sanitize';
import { isRateLimited } from '../../lib/rate-limit';

export const prerender = false;

export async function POST({ request, clientAddress }: APIContext) {
  // 1. Verify Origin (anti-CSRF)
  const origin = request.headers.get('origin');
  const allowedOrigins = [
    import.meta.env.SITE_URL,
    'http://localhost:4321',
    'http://localhost:3000',
  ].filter(Boolean);

  if (!origin || !allowedOrigins.some((o) => origin.startsWith(o))) {
    return new Response(JSON.stringify({ error: 'Origine non autorizzata' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 2. Rate limiting
  const ip = clientAddress || request.headers.get('x-forwarded-for') || 'unknown';
  if (isRateLimited(ip)) {
    return new Response(
      JSON.stringify({ error: 'Troppe richieste. Riprova tra un minuto.' }),
      {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  // 3. Parse and sanitize
  let rawData: Record<string, unknown>;
  try {
    rawData = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Dati non validi' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const data = sanitizeFormData(rawData) as unknown as QuoteFormData;

  // 4. Server-side validation
  const errors = validateQuoteForm(data);
  if (errors.length > 0) {
    // Honeypot: silently accept to not reveal bot detection
    if (errors[0].field === 'honeypot') {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ errors }), {
      status: 422,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 5. Send email via Resend
  const resend = new Resend(import.meta.env.RESEND_API_KEY);

  try {
    await resend.emails.send({
      from: import.meta.env.RESEND_FROM_EMAIL,
      to: import.meta.env.VETRERIA_EMAIL,
      subject: `Richiesta preventivo: ${data.serviceType} — ${data.name}`,
      html: `
        <h2>Nuova richiesta di preventivo</h2>
        <p><strong>Nome:</strong> ${data.name}</p>
        <p><strong>Telefono:</strong> ${data.phone}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Tipo di lavoro:</strong> ${data.serviceType}</p>
        ${data.description ? `<p><strong>Descrizione:</strong> ${data.description}</p>` : ''}
        ${data.measurements ? `<p><strong>Misure:</strong> ${data.measurements}</p>` : ''}
        <hr />
        <p><small>Inviato dal sito web — IP: ${ip}</small></p>
      `,
    });
  } catch {
    return new Response(
      JSON.stringify({ error: 'Errore invio email. Riprova o chiamaci.' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
