import { validateQuoteForm, type QuoteFormData } from './validation';
import { headerSafe, sanitizeFormData } from './sanitize';
import { isRateLimited } from './rate-limit';
import { quoteRequestEmail } from './email-templates/quote-request';
import { report } from './sentry-report';
import type { TurnstileOutcome } from './turnstile';

export interface SendQuoteConfig {
  allowedOrigins: string[];
  resendApiKey: string;
  fromEmail: string;
  toEmail: string;
  // false fuori dalla produzione: la preview Vercel viene scansionata da HawkScan, e con la
  // chiave Resend messa lì per sbaglio ogni corpo valido diventerebbe un'email vera.
  sendEmails: boolean;
  // Verifica Turnstile (src/lib/turnstile.ts), iniettata come l'EmailSender: i test la
  // sostituiscono senza rete. Obbligatoria: un default "ok" sarebbe fail-open.
  verifyHuman: (token: unknown) => Promise<TurnstileOutcome>;
}

export interface SendQuoteRequest {
  origin: string | null;
  ip: string;
  body: unknown;
}

export const EMAIL_ERROR = 'Errore invio email. Riprova o chiamaci.';
export const TURNSTILE_ERROR = 'Verifica anti-spam non riuscita. Riprova o chiamaci.';

interface JsonResponse {
  status: number;
  body: Record<string, unknown>;
}

function json(status: number, body: Record<string, unknown>): JsonResponse {
  return { status, body };
}

function dryRun(): JsonResponse {
  console.log('[send-quote] Dry run — skipping email');
  return json(200, { success: true, dryRun: true });
}

export interface EmailSender {
  send(params: {
    from: string;
    to: string;
    replyTo: string;
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
    console.warn('[send-quote] Origin rejected:', req.origin);
    return json(403, { error: 'Origine non autorizzata' });
  }

  // 2. Rate limiting
  if (await isRateLimited(req.ip)) {
    console.warn('[send-quote] Rate limited');
    return json(429, { error: 'Troppe richieste. Riprova tra un minuto.' });
  }

  // 3. Sanitize and validate
  if (!req.body || typeof req.body !== 'object') {
    return json(400, { error: 'Dati non validi' });
  }

  const fields = sanitizeFormData(req.body as Record<string, unknown>);

  const errors = validateQuoteForm(fields);
  if (errors.length > 0) {
    // Honeypot: silently accept to not reveal bot detection
    if (errors[0].field === 'honeypot') {
      // Un autocompletamento che riempie il campo nascosto perderebbe un lead vero senza
      // traccia: la riga nei log Vercel lo rende contabile. Nessun dato del form.
      console.warn('[send-quote] Honeypot filled, email not sent');
      return json(200, { success: true });
    }
    return json(422, { errors });
  }
  // Il tipo si afferma solo dopo la validazione superata (F3).
  const data = fields as unknown as QuoteFormData;

  // 4. Dry run del corpo (Checkly, api.check.ts): prima di Turnstile, che un monitor non può
  // superare. Non parte nessuna email; chi lo usa ottiene solo la validazione.
  if (fields.dryRun === true) return dryRun();

  // 5. Turnstile: un'email parte solo per un browser che ha superato la verifica. Dopo il rate
  // limit (siteverify non diventa un amplificatore) e dopo la validazione (un 422 non consuma il
  // token monouso).
  const human = await config.verifyHuman(fields.turnstileToken);
  if (human.kind === 'invalid') {
    return json(403, { error: TURNSTILE_ERROR });
  }
  if (human.kind === 'unavailable') {
    // Fail-closed: senza verifica niente email. A Sentry solo il codice, mai token né IP.
    console.error('[send-quote] Turnstile non disponibile:', human.code);
    await report(new Error(`Turnstile ${human.code}`));
    return json(503, { error: EMAIL_ERROR });
  }

  // 6. Fuori produzione niente email (preview scansionata da HawkScan, dev)
  if (!config.sendEmails) return dryRun();

  // 7. Send email
  try {
    const { data: emailData, error: emailError } = await emailSender.send({
      from: config.fromEmail,
      to: config.toEmail,
      // Il "Rispondi" della vetreria va al cliente, non al mittente tecnico (Resend: replyTo).
      replyTo: data.email,
      subject: headerSafe(`Richiesta preventivo: ${data.serviceType} — ${data.name}`),
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
      // Solo il nome (codice dell'errore): il messaggio è testo di Resend che potrebbe citare i
      // campi dell'email, e l'oggetto contiene il nome del visitatore. Resta nei log Vercel.
      await report(new Error(`Resend ${emailError.name}`));
      return json(500, { error: EMAIL_ERROR });
    }

    console.log('[send-quote] Email sent successfully, id:', emailData?.id);
  } catch (err) {
    console.error('[send-quote] Unexpected error:', err);
    await report(err);
    return json(500, { error: EMAIL_ERROR });
  }

  return json(200, { success: true });
}
