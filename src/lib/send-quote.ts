import { validateQuoteForm, type QuoteFormData } from './validation';
import { sanitizeFormData } from './sanitize';
import { isRateLimited } from './rate-limit';
import { quoteRequestEmail } from './email-templates/quote-request';

export interface SendQuoteConfig {
  allowedOrigins: string[];
  resendApiKey: string;
  fromEmail: string;
  toEmail: string;
}

export interface SendQuoteRequest {
  origin: string | null;
  ip: string;
  body: unknown;
}

interface JsonResponse {
  status: number;
  body: Record<string, unknown>;
}

function json(status: number, body: Record<string, unknown>): JsonResponse {
  return { status, body };
}

export interface EmailSender {
  send(params: {
    from: string;
    to: string;
    subject: string;
    html: string;
  }): Promise<{ data: { id: string } | null; error: { name: string; message: string } | null }>;
}

export async function handleSendQuote(
  req: SendQuoteRequest,
  config: SendQuoteConfig,
  emailSender: EmailSender
): Promise<JsonResponse> {
  // 1. Verify Origin (anti-CSRF)
  if (!req.origin || !config.allowedOrigins.includes(req.origin)) {
    console.warn('[send-quote] Origin rejected:', req.origin, 'from IP:', req.ip);
    return json(403, { error: 'Origine non autorizzata' });
  }

  // 2. Rate limiting
  if (isRateLimited(req.ip)) {
    console.warn('[send-quote] Rate limited IP:', req.ip);
    return json(429, { error: 'Troppe richieste. Riprova tra un minuto.' });
  }

  // 3. Sanitize and validate
  if (!req.body || typeof req.body !== 'object') {
    return json(400, { error: 'Dati non validi' });
  }

  const data = sanitizeFormData(req.body as Record<string, unknown>) as unknown as QuoteFormData;

  const errors = validateQuoteForm(data);
  if (errors.length > 0) {
    // Honeypot: silently accept to not reveal bot detection
    if (errors[0].field === 'honeypot') {
      return json(200, { success: true });
    }
    return json(422, { errors });
  }

  // 4. Dry run: skip email (used by Checkly monitoring)
  if ((req.body as Record<string, unknown>).dryRun === true) {
    console.log('[send-quote] Dry run — skipping email');
    return json(200, { success: true, dryRun: true });
  }

  // 5. Send email
  try {
    const { data: emailData, error: emailError } = await emailSender.send({
      from: config.fromEmail,
      to: config.toEmail,
      subject: `Richiesta preventivo: ${data.serviceType} — ${data.name}`,
      html: quoteRequestEmail({
        name: data.name,
        phone: data.phone,
        email: data.email,
        serviceType: data.serviceType,
        description: data.description,
        measurements: data.measurements,
        ip: req.ip,
      }),
    });

    if (emailError) {
      console.error('[send-quote] Resend error:', emailError.name, emailError.message);
      return json(500, { error: 'Errore invio email. Riprova o chiamaci.' });
    }

    console.log('[send-quote] Email sent successfully, id:', emailData?.id);
  } catch (err) {
    console.error('[send-quote] Unexpected error:', err);
    return json(500, { error: 'Errore invio email. Riprova o chiamaci.' });
  }

  return json(200, { success: true });
}
