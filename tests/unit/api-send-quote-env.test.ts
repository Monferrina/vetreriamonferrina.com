import { describe, it, expect, vi } from 'vitest';

// Variante con env del server MANCANTE: copre i rami di fallback del wrapper
// (`SITE_URL || ''`, `RESEND_* ?? ''`). vitest isola i mock per file, quindi
// questa configurazione non interferisce con api-send-quote.test.ts.
vi.mock('astro:env/server', () => ({
  RESEND_API_KEY: undefined,
  RESEND_FROM_EMAIL: undefined,
  VETRERIA_EMAIL: undefined,
  SITE_URL: undefined,
}));

vi.mock('resend', () => ({
  Resend: class {
    emails = {
      send: async () => ({ data: null, error: null }),
    };
  },
}));

import { POST } from '../../src/pages/api/send-quote';

describe('POST /api/send-quote — env del server mancante', () => {
  it('senza SITE_URL nessuna origine è autorizzata → 403', async () => {
    const headers = new Headers({ 'Content-Type': 'application/json' });
    headers.set('origin', 'https://vetreriamonferrina.com');
    const request = {
      json: async () => ({
        name: 'Mario Rossi',
        phone: '+39 0142 123456',
        email: 'mario@example.com',
        serviceType: 'box-doccia',
        description: 'Vorrei un box doccia su misura',
        measurements: '120x80',
        privacy: true,
        dryRun: true,
      }),
      headers,
    };
    const res = await POST({
      request,
      clientAddress: '127.0.0.1',
    } as unknown as Parameters<typeof POST>[0]);

    expect(res.status).toBe(403);
  });
});
