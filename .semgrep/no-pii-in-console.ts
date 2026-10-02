// Test della regola no-pii-in-console: IP e dati del form non vanno nei console.*
// (finiscono nei log di Vercel e, come breadcrumb, negli eventi Sentry).

declare const req: { ip: string; origin: string; body: unknown };
declare const request: Request;
declare const ctx: { clientAddress: string };
declare function sanitizeFormData(body: unknown): { name: string; email: string; phone: string };
declare const emailError: { name: string; message: string };
declare const emailSender: {
  send(m: {
    html: string;
  }): Promise<{ data: { id: string } | null; error: { name: string } | null }>;
};

export async function casi() {
  // ruleid: no-pii-in-console
  console.warn('[send-quote] Rate limited IP:', req.ip);

  // ruleid: no-pii-in-console
  console.warn('[send-quote] Origin rejected:', req.origin, 'from IP:', req.ip);

  // ruleid: no-pii-in-console
  console.log(`client ${ctx.clientAddress}`);

  const ip = request.headers.get('x-forwarded-for');
  // ruleid: no-pii-in-console
  console.error('fallito per', ip);

  // ruleid: no-pii-in-console
  console.info(request.headers.get('cf-connecting-ip'));

  const data = sanitizeFormData(req.body);
  // ruleid: no-pii-in-console
  console.log('preventivo da', data.email);

  // ruleid: no-pii-in-console
  console.log({ nome: data.name });

  const body = await request.json();
  // ruleid: no-pii-in-console
  console.debug(body);

  // ok: no-pii-in-console
  console.warn('[send-quote] Origin rejected:', req.origin);

  // ok: no-pii-in-console
  console.error('[send-quote] Resend error:', emailError.name, emailError.message);

  // ok: no-pii-in-console
  console.log('[send-quote] Dry run — skipping email');

  // ok: no-pii-in-console
  console.log(request.headers.get('user-agent'));

  const meteo = await (await fetch('https://api.open-meteo.com/v1/forecast')).json();
  // ok: no-pii-in-console
  console.log(meteo);

  // La risposta del provider email non contiene il form, anche se il form entra nella chiamata.
  const { data: inviata, error } = await emailSender.send({ html: data.name });
  // ok: no-pii-in-console
  console.error('[send-quote] Resend error:', error?.name);
  // ok: no-pii-in-console
  console.log('[send-quote] Email sent successfully, id:', inviata?.id);
}
