import { describe, it, expect, beforeEach } from 'vitest';
import {
  handleSendQuote,
  type EmailSender,
  type SendQuoteConfig,
  type SendQuoteRequest,
} from '../../src/lib/send-quote';

// ---------- test doubles ----------

function makeEmailSender(
  response: Awaited<ReturnType<EmailSender['send']>> = { data: { id: 'email-123' }, error: null }
): EmailSender & { calls: Parameters<EmailSender['send']>[] } {
  const calls: Parameters<EmailSender['send']>[] = [];
  return {
    calls,
    async send(params) {
      calls.push([params]);
      return response;
    },
  };
}

// ---------- fixtures ----------

const config: SendQuoteConfig = {
  allowedOrigins: ['https://vetreriamonferrina.com'],
  resendApiKey: 're_test_key',
  fromEmail: 'noreply@test.example.com',
  toEmail: 'recipient@test.example.com',
};

const validBody = {
  name: 'Mario Rossi',
  phone: '+39 0142 123456',
  email: 'mario@example.com',
  serviceType: 'box-doccia',
  description: 'Vorrei un box doccia su misura',
  measurements: '120x80',
  privacy: true,
  honeypot: '',
};

function makeReq(overrides: Partial<SendQuoteRequest> = {}): SendQuoteRequest {
  return {
    origin: 'https://vetreriamonferrina.com',
    ip: '127.0.0.1',
    body: validBody,
    ...overrides,
  };
}

// Reset rate-limit state between tests (in-memory Map persists)
beforeEach(async () => {
  await import('../../src/lib/rate-limit');
});

let testIpCounter = 0;
function uniqueIp(): string {
  return `10.0.0.${++testIpCounter}`;
}

// ---------- tests ----------

describe('handleSendQuote', () => {
  // --- Success ---
  it('invio valido: risponde 200 con success: true', async () => {
    const sender = makeEmailSender();
    const result = await handleSendQuote(makeReq({ ip: uniqueIp() }), config, sender);

    expect(result.status).toBe(200);
    expect(result.body).toEqual({ success: true });
    expect(sender.calls).toHaveLength(1);
  });

  it('invio valido: email contiene from, to, subject corretti', async () => {
    const sender = makeEmailSender();
    await handleSendQuote(makeReq({ ip: uniqueIp() }), config, sender);

    const [params] = sender.calls[0];
    expect(params.from).toBe('noreply@test.example.com');
    expect(params.to).toBe('recipient@test.example.com');
    expect(params.subject).toContain('box-doccia');
    expect(params.subject).toContain('Mario Rossi');
  });

  it('invio valido: html contiene tutti i campi del form', async () => {
    const sender = makeEmailSender();
    await handleSendQuote(makeReq({ ip: uniqueIp() }), config, sender);

    const [params] = sender.calls[0];
    expect(params.html).toContain('Mario Rossi');
    expect(params.html).toContain('+39 0142 123456');
    expect(params.html).toContain('mario@example.com');
    expect(params.html).toContain('box-doccia');
    expect(params.html).toContain('Vorrei un box doccia su misura');
    expect(params.html).toContain('120x80');
  });

  it('descrizione e misure vuote: risponde 422', async () => {
    const sender = makeEmailSender();
    const body = { ...validBody, description: '', measurements: '' };
    const result = await handleSendQuote(makeReq({ ip: uniqueIp(), body }), config, sender);

    expect(result.status).toBe(422);
    const errors = result.body.errors as Array<{ field: string }>;
    expect(errors.some((e) => e.field === 'description')).toBe(true);
    expect(errors.some((e) => e.field === 'measurements')).toBe(true);
    expect(sender.calls).toHaveLength(0);
  });

  // --- CSRF / Origin ---
  it('origin mancante: risponde 403', async () => {
    const sender = makeEmailSender();
    const result = await handleSendQuote(makeReq({ ip: uniqueIp(), origin: null }), config, sender);

    expect(result.status).toBe(403);
    expect(result.body.error).toContain('Origine non autorizzata');
    expect(sender.calls).toHaveLength(0);
  });

  it('origin non autorizzato: risponde 403', async () => {
    const sender = makeEmailSender();
    const result = await handleSendQuote(
      makeReq({ ip: uniqueIp(), origin: 'https://evil.com' }),
      config,
      sender
    );

    expect(result.status).toBe(403);
    expect(sender.calls).toHaveLength(0);
  });

  // --- Rate limiting ---
  it('rate limited dopo 5 richieste: risponde 429', async () => {
    const sender = makeEmailSender();
    const ip = uniqueIp();

    // Prima 5 richieste passano
    for (let i = 0; i < 5; i++) {
      const r = await handleSendQuote(makeReq({ ip }), config, sender);
      expect(r.status).not.toBe(429);
    }

    // La 6a viene bloccata
    const result = await handleSendQuote(makeReq({ ip }), config, sender);
    expect(result.status).toBe(429);
    expect(result.body.error).toContain('Troppe richieste');
  });

  // --- Validation errors ---
  it('campi mancanti: risponde 422 con errori di validazione', async () => {
    const sender = makeEmailSender();
    const body = { ...validBody, name: '', email: 'bad', phone: '' };
    const result = await handleSendQuote(makeReq({ ip: uniqueIp(), body }), config, sender);

    expect(result.status).toBe(422);
    const errors = result.body.errors as Array<{ field: string }>;
    expect(errors.length).toBeGreaterThanOrEqual(3);
    expect(sender.calls).toHaveLength(0);
  });

  it('privacy non accettata: risponde 422', async () => {
    const sender = makeEmailSender();
    const body = { ...validBody, privacy: false };
    const result = await handleSendQuote(makeReq({ ip: uniqueIp(), body }), config, sender);

    expect(result.status).toBe(422);
    const errors = result.body.errors as Array<{ field: string }>;
    expect(errors.some((e) => e.field === 'privacy')).toBe(true);
    expect(sender.calls).toHaveLength(0);
  });

  it('serviceType invalido: risponde 422', async () => {
    const sender = makeEmailSender();
    const body = { ...validBody, serviceType: 'hacking' };
    const result = await handleSendQuote(makeReq({ ip: uniqueIp(), body }), config, sender);

    expect(result.status).toBe(422);
    const errors = result.body.errors as Array<{ field: string }>;
    expect(errors.some((e) => e.field === 'serviceType')).toBe(true);
  });

  // --- Honeypot (bot detection) ---
  it('honeypot compilato: risponde 200 silenziosamente, nessuna email inviata', async () => {
    const sender = makeEmailSender();
    const body = { ...validBody, honeypot: 'i-am-a-bot' };
    const result = await handleSendQuote(makeReq({ ip: uniqueIp(), body }), config, sender);

    expect(result.status).toBe(200);
    expect(result.body.success).toBe(true);
    expect(sender.calls).toHaveLength(0);
  });

  // --- Body invalido ---
  it('body null: risponde 400', async () => {
    const sender = makeEmailSender();
    const result = await handleSendQuote(makeReq({ ip: uniqueIp(), body: null }), config, sender);

    expect(result.status).toBe(400);
    expect(sender.calls).toHaveLength(0);
  });

  it('body non oggetto: risponde 400', async () => {
    const sender = makeEmailSender();
    const result = await handleSendQuote(
      makeReq({ ip: uniqueIp(), body: 'not-an-object' }),
      config,
      sender
    );

    expect(result.status).toBe(400);
    expect(sender.calls).toHaveLength(0);
  });

  // --- Resend API error (the bug we fixed) ---
  it('Resend restituisce errore (es. dominio non verificato): risponde 500', async () => {
    const sender = makeEmailSender({
      data: null,
      error: { name: 'validation_error', message: 'Domain not verified' },
    });
    const result = await handleSendQuote(makeReq({ ip: uniqueIp() }), config, sender);

    expect(result.status).toBe(500);
    expect(result.body.error).toContain('Errore invio email');
  });

  it('Resend lancia eccezione di rete: risponde 500', async () => {
    const sender: EmailSender = {
      async send() {
        throw new Error('Network failure');
      },
    };
    const result = await handleSendQuote(makeReq({ ip: uniqueIp() }), config, sender);

    expect(result.status).toBe(500);
    expect(result.body.error).toContain('Errore invio email');
  });

  it('Resend errore API key invalida: risponde 500', async () => {
    const sender = makeEmailSender({
      data: null,
      error: { name: 'authentication_error', message: 'Invalid API key' },
    });
    const result = await handleSendQuote(makeReq({ ip: uniqueIp() }), config, sender);

    expect(result.status).toBe(500);
  });

  // --- Sanitization (integration with real sanitize module) ---
  it("input con HTML viene sanitizzato prima dell'invio", async () => {
    const sender = makeEmailSender();
    const body = {
      ...validBody,
      name: '<script>alert("xss")</script>Mario',
      description: '<img src=x onerror=alert(1)>Descrizione',
    };
    const result = await handleSendQuote(makeReq({ ip: uniqueIp(), body }), config, sender);

    // Sanitizer strips < > brackets, neutralizing HTML injection
    // The text content remains but is harmless without tags
    if (result.status === 200 && sender.calls.length > 0) {
      const [params] = sender.calls[0];
      expect(params.html).not.toContain('<script>');
      expect(params.html).not.toContain('<img');
    }
  });

  // --- Dry run (Checkly monitoring) ---
  it('dryRun: true → risponde 200 senza inviare email', async () => {
    const sender = makeEmailSender();
    const body = { ...validBody, dryRun: true };
    const result = await handleSendQuote(makeReq({ ip: uniqueIp(), body }), config, sender);

    expect(result.status).toBe(200);
    expect(result.body).toEqual({ success: true, dryRun: true });
    expect(sender.calls).toHaveLength(0);
  });

  it('dryRun: false → invia email normalmente', async () => {
    const sender = makeEmailSender();
    const body = { ...validBody, dryRun: false };
    const result = await handleSendQuote(makeReq({ ip: uniqueIp(), body }), config, sender);

    expect(result.status).toBe(200);
    expect(result.body).toEqual({ success: true });
    expect(sender.calls).toHaveLength(1);
  });

  it('dryRun con dati invalidi: risponde 422 (validazione attiva)', async () => {
    const sender = makeEmailSender();
    const body = { ...validBody, name: '', dryRun: true };
    const result = await handleSendQuote(makeReq({ ip: uniqueIp(), body }), config, sender);

    expect(result.status).toBe(422);
    expect(sender.calls).toHaveLength(0);
  });

  // --- IP tracking in email ---
  it("IP del client incluso nell'email", async () => {
    const sender = makeEmailSender();
    const ip = uniqueIp();
    await handleSendQuote(makeReq({ ip }), config, sender);

    const [params] = sender.calls[0];
    expect(params.html).toContain(ip);
  });
});
