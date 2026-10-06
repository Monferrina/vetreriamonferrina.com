// @vitest-environment node
// Ambiente node: '@sentry/astro' risolve l'SDK server (@sentry/node), lo stesso della funzione Vercel.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import * as Sentry from '@sentry/astro';
import { createTransport, type BaseTransportOptions } from '@sentry/core';
import { handleSendQuote, type EmailSender } from '../../src/lib/send-quote';
import { sentryOptions } from '../../src/lib/sentry-options';
import { config, validBody } from './send-quote-fixtures';

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
      await Sentry.flush(2000);

      expect(result.status).toBe(500);
      expect(sent).toHaveLength(1);
      expect(sent[0]).toContain(expected);
      for (const value of Object.values(visitor)) expect(sent[0]).not.toContain(value);
    }
  );
});
