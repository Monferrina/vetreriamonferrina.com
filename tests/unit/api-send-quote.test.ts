import { describe, it, expect, vi } from 'vitest';

// Il wrapper importa i due confini esterni: l'env del server Astro e Resend.
// Li mockiamo per testare l'adattatore in isolamento (la logica pura è già
// coperta da send-quote.test.ts via dependency injection).
vi.mock('astro:env/server', () => ({
  RESEND_API_KEY: 're_test_key',
  RESEND_FROM_EMAIL: 'noreply@test.example.com',
  VETRERIA_EMAIL: 'recipient@test.example.com',
  SITE_URL: 'https://vetreriamonferrina.com',
}));

// Resend mockato: nessuna chiamata di rete. Con dryRun l'email non viene
// comunque mai inviata, ma il mock garantisce zero effetti collaterali.
vi.mock('resend', () => ({
  Resend: class {
    emails = {
      send: async () => ({ data: { id: 'email-test' }, error: null }),
    };
  },
}));

import { POST } from '../../src/pages/api/send-quote';

// Nota: `Origin` è un forbidden header: un vero `new Request({headers:{Origin}})`
// lo rimuove (spec Fetch), rendendo impossibile testare il controllo origin. Usiamo
// quindi un context che espone l'interaccia minima usata dal wrapper (`request.json()`
// e `request.headers.get('origin')`) con un `Headers` standalone, che non filtra.
function makeContext(body: string, origin: string | null = 'https://vetreriamonferrina.com') {
  const headers = new Headers({ 'Content-Type': 'application/json' });
  if (origin) headers.set('origin', origin);
  const request = {
    json: async () => JSON.parse(body),
    headers,
  };
  return { request, clientAddress: '127.0.0.1' } as unknown as Parameters<typeof POST>[0];
}

const validDryRunBody = JSON.stringify({
  name: 'Mario Rossi',
  phone: '+39 0142 123456',
  email: 'mario@example.com',
  serviceType: 'box-doccia',
  description: 'Vorrei un box doccia su misura',
  measurements: '120x80',
  privacy: true,
  dryRun: true,
});

describe('POST /api/send-quote (wrapper)', () => {
  it('JSON non parsabile: risponde 400 "Dati non validi"', async () => {
    const res = await POST(makeContext('{ questo non e json'));

    expect(res.status).toBe(400);
    expect(res.headers.get('Content-Type')).toBe('application/json');
    const json = await res.json();
    expect(json.error).toBe('Dati non validi');
  });

  it('richiesta valida (dryRun): inoltra alla logica e risponde 200', async () => {
    const res = await POST(makeContext(validDryRunBody));

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('application/json');
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.dryRun).toBe(true);
  });

  it('origin non autorizzato: il wrapper propaga il 403 della logica', async () => {
    const res = await POST(makeContext(validDryRunBody, 'https://evil.com'));

    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error).toContain('Origine non autorizzata');
  });
});
