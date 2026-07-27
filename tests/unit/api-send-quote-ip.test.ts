import { describe, it, expect, vi, beforeEach } from 'vitest';

// Stessi confini esterni mockati di api-send-quote.test.ts: env del server e Resend.
// Qui però l'email NON è in dryRun, perché è proprio il corpo dell'email l'unico punto
// da cui si può osservare quale IP la route ha risolto.
vi.mock('astro:env/server', () => ({
  RESEND_API_KEY: 're_test_key',
  RESEND_FROM_EMAIL: 'noreply@test.example.com',
  VETRERIA_EMAIL: 'recipient@test.example.com',
  SITE_URL: 'https://vetreriamonferrina.com',
}));

const inviate: { html: string }[] = [];
vi.mock('resend', () => ({
  Resend: class {
    emails = {
      send: async (payload: { html: string }) => {
        inviate.push(payload);
        return { data: { id: 'email-test' }, error: null };
      },
    };
  },
}));

import { POST } from '../../src/pages/api/send-quote';

const corpoValido = JSON.stringify({
  name: 'Mario Rossi',
  phone: '+39 0142 123456',
  email: 'mario@example.com',
  serviceType: 'box-doccia',
  description: 'Vorrei un box doccia su misura per il bagno',
  measurements: '120x80',
  privacy: true,
  honeypot: '',
});

function contesto(headers: Record<string, string>, clientAddress?: string) {
  const h = new Headers({ 'Content-Type': 'application/json' });
  h.set('origin', 'https://vetreriamonferrina.com');
  for (const [k, v] of Object.entries(headers)) h.set(k, v);
  return {
    request: { json: async () => JSON.parse(corpoValido), headers: h },
    clientAddress,
  } as unknown as Parameters<typeof POST>[0];
}

// La route risolve l'IP con una catena di fallback:
//   cf-connecting-ip → clientAddress → x-forwarded-for → 'unknown'
// Solo il primo anello era coperto. Gli altri contano: l'IP è la CHIAVE del rate limit,
// quindi se la catena collassa su 'unknown' tutti i visitatori finiscono nello stesso
// secchiello — 5 richieste al minuto in totale, e il form muore per chiunque.
describe('risoluzione dell IP nella route (chiave del rate limit)', () => {
  beforeEach(() => {
    inviate.length = 0;
  });

  const ipInEmail = () => {
    const m = inviate.at(-1)?.html.match(/IP:\s*([^<\s]+)/);
    return m?.[1];
  };

  it('preferisce cf-connecting-ip a tutto il resto', async () => {
    await POST(
      contesto({ 'cf-connecting-ip': '203.0.113.7', 'x-forwarded-for': '198.51.100.1' }, '10.0.0.1')
    );
    expect(ipInEmail()).toBe('203.0.113.7');
  });

  it('senza header Cloudflare usa clientAddress', async () => {
    await POST(contesto({ 'x-forwarded-for': '198.51.100.1' }, '10.0.0.1'));
    expect(ipInEmail()).toBe('10.0.0.1');
  });

  it('senza Cloudflare né clientAddress ripiega su x-forwarded-for', async () => {
    await POST(contesto({ 'x-forwarded-for': '198.51.100.1' }));
    expect(ipInEmail()).toBe('198.51.100.1');
  });

  it("senza nessuna fonte finisce su 'unknown' — il caso che accomuna tutti i visitatori", async () => {
    await POST(contesto({}));
    expect(ipInEmail()).toBe('unknown');
  });
});
