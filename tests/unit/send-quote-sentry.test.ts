// @vitest-environment node
// Ambiente node: '@sentry/astro' risolve l'SDK server (@sentry/node), lo stesso della funzione Vercel.
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import * as Sentry from '@sentry/astro';
import { createTransport, type BaseTransportOptions } from '@sentry/core';
import { handleSendQuote, type EmailSender } from '../../src/lib/send-quote';
import { sentryOptions } from '../../src/lib/sentry-options';
import { config, validBody } from './send-quote-fixtures';
import { POST } from '../../src/pages/api/send-quote';
import { isRateLimited } from '../../src/lib/rate-limit';
import { errors } from '@upstash/redis';

vi.mock('astro:env/server', () => ({
  RESEND_API_KEY: 're_test_key',
  RESEND_FROM_EMAIL: config.fromEmail,
  VETRERIA_EMAIL: config.toEmail,
  SITE_URL: 'https://vetreriamonferrina.com',
}));

// Corpi delle envelope che l'SDK manderebbe a Sentry: si guarda ciò che esce davvero,
// dopo beforeSend e le opzioni di dataCollection.
const sent: string[] = [];

beforeAll(() => {
  Sentry.init({
    ...sentryOptions,
    dsn: 'https://public@o0.ingest.sentry.io/0',
    transport: (options: BaseTransportOptions) =>
      createTransport(options, async (request) => {
        sent.push(
          typeof request.body === 'string' ? request.body : new TextDecoder().decode(request.body)
        );
        return { statusCode: 200 };
      }),
  });
});

afterAll(() => Sentry.close());

// Valori che non devono mai uscire verso Sentry: i dati del modulo e l'IP del visitatore.
const visitor = {
  name: validBody.name,
  phone: validBody.phone,
  email: validBody.email,
  ip: '203.0.113.7',
};

const failures: [string, EmailSender['send'], string][] = [
  [
    'Resend risponde con un errore',
    async () => ({
      data: null,
      error: { name: 'validation_error', message: 'The domain is not verified' },
    }),
    'validation_error',
  ],
  [
    "l'invio lancia un'eccezione",
    async () => {
      throw new TypeError('fetch failed');
    },
    'fetch failed',
  ],
];

describe('handleSendQuote → Sentry', () => {
  it.each(failures)(
    "%s: l'errore arriva a Sentry senza dati del visitatore",
    async (_, send, expected) => {
      sent.length = 0;
      const result = await handleSendQuote(
        { origin: 'https://vetreriamonferrina.com', ip: visitor.ip, body: validBody },
        config,
        { send }
      );

      expect(result.status).toBe(500);
      expect(sent).toHaveLength(1);
      expect(sent[0]).toContain(expected);
      for (const value of Object.values(visitor)) expect(sent[0]).not.toContain(value);
    }
  );
});

describe('POST /api/send-quote → Sentry', () => {
  // Errore simulato: il getter di clientAddress lancia, come fa l'adapter Vercel quando manca
  // x-forwarded-for (misurato sulla funzione buildata in locale; su Vercel l'header c'è sempre).
  it('un errore inatteso nel gestore risponde 500 JSON e arriva a Sentry senza dati del visitatore', async () => {
    sent.length = 0;
    const headers = new Headers({
      'Content-Type': 'application/json',
      origin: 'https://vetreriamonferrina.com',
    });
    const context = {
      request: { json: async () => validBody, headers },
      get clientAddress(): string {
        throw new Error('ClientAddressNotAvailable');
      },
    } as unknown as Parameters<typeof POST>[0];

    const res = await POST(context);

    expect(res.status).toBe(500);
    expect(res.headers.get('Content-Type')).toBe('application/json');
    expect(sent).toHaveLength(1);
    expect(sent[0]).toContain('ClientAddressNotAvailable');
    for (const value of Object.values(visitor)) expect(sent[0]).not.toContain(value);
  });
});

describe('isRateLimited → Sentry', () => {
  // @upstash/redis 1.39.0 mette nel messaggio il comando intero ("command was: …"), e la
  // chiave del limite è l'IP del visitatore.
  it("Upstash lancia: il guasto arriva a Sentry senza l'IP e il limite ripiega sulla memoria", async () => {
    sent.length = 0;
    // IP suo: il contatore in memoria è condiviso con gli altri test del file.
    const ip = '198.51.100.77';
    const broken = {
      limit: () =>
        Promise.reject(
          new errors.UpstashError(
            `ERR max daily request limit exceeded, command was: ["evalsha","x",["rl:quote:${ip}"]]`
          )
        ),
    };

    const limited = await isRateLimited(ip, broken);

    expect(limited).toBe(false);
    expect(sent).toHaveLength(1);
    expect(sent[0]).toContain('UpstashError');
    expect(sent[0]).not.toContain(ip);
  });
});
