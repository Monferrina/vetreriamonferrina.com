import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import process from 'node:process';
import { onRequest } from '../../src/middleware';

// Contesto Astro minimale per il middleware (usa solo url + request.headers).
function ctx(pathname: string, headers: Record<string, string> = {}) {
  const url = `https://vetreriamonferrina.com${pathname}`;
  return { url: new URL(url), request: new Request(url, { headers }) } as never;
}
const NEXT = async () => new Response('OK', { status: 200 });

describe('middleware — origin lockdown (solo /api)', () => {
  const original = { ...process.env };
  beforeEach(() => {
    process.env.VERCEL_ENV = 'production';
    process.env.ORIGIN_VERIFY_SECRET = 'sekret';
  });
  afterEach(() => {
    process.env = { ...original };
  });

  // REGRESSIONE OUTAGE 2026-07-04: senza la guardia `/api/`, il middleware girava al
  // prerender di build (VERCEL_ENV=production + secret, nessun header) e compilava OGNI
  // pagina statica come "Forbidden". Questo test fallisce se qualcuno toglie la guardia.
  it('NON blocca le pagine statiche in produzione con secret (guardia /api)', async () => {
    for (const p of ['/', '/servizi/box-doccia', '/contatti', '/faq', '/maintenance']) {
      const res = (await onRequest(ctx(p), NEXT)) as Response;
      expect(res.status).toBe(200);
    }
  });

  it('blocca con 403 le richieste /api senza x-origin-verify valido (in produzione)', async () => {
    const res = (await onRequest(ctx('/api/send-quote'), NEXT)) as Response;
    expect(res.status).toBe(403);
  });

  it('blocca /api con x-origin-verify sbagliato', async () => {
    const res = (await onRequest(
      ctx('/api/send-quote', { 'x-origin-verify': 'nope' }),
      NEXT
    )) as Response;
    expect(res.status).toBe(403);
  });

  it('lascia passare /api con x-origin-verify corretto (traffico via Worker)', async () => {
    const res = (await onRequest(
      ctx('/api/send-quote', { 'x-origin-verify': 'sekret' }),
      NEXT
    )) as Response;
    expect(res.status).toBe(200);
  });

  it('fail-open: secret non configurato → non blocca (deploy sicuro)', async () => {
    delete process.env.ORIGIN_VERIFY_SECRET;
    const res = (await onRequest(ctx('/api/send-quote'), NEXT)) as Response;
    expect(res.status).toBe(200);
  });

  it('non blocca /api fuori produzione (preview/dev escluse)', async () => {
    process.env.VERCEL_ENV = 'preview';
    const res = (await onRequest(ctx('/api/send-quote'), NEXT)) as Response;
    expect(res.status).toBe(200);
  });
});
