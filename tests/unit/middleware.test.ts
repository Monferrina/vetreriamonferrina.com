import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { onRequest } from '../../src/middleware';
import { cspHeader } from '../../src/lib/csp';

// Contesto Astro minimale: il middleware non lo legge, serve solo alla firma di onRequest.
function ctx(pathname: string) {
  const url = `https://vetreriamonferrina.com${pathname}`;
  return { url: new URL(url), request: new Request(url) } as never;
}
const NEXT = async () => new Response('OK', { status: 200 });

describe('middleware — CSP sulle risposte on demand', () => {
  // Vitest gira con DEV=true: questi casi descrivono build e produzione.
  beforeEach(() => {
    vi.stubEnv('DEV', false);
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  // Le pagine HTML hanno il CSP da Astro (security.csp, con gli hash degli script inline); le
  // risposte senza (_image) lo ricevono qui, dalle stesse direttive.
  it('risposta senza CSP: header con le direttive condivise, senza unsafe-inline', async () => {
    const res = (await onRequest(ctx('/pagina-inesistente'), NEXT)) as Response;
    const csp = res.headers.get('Content-Security-Policy');
    expect(csp).toBe(cspHeader);
    expect(csp).not.toContain("'unsafe-inline'");
  });

  // Un 404 (o 500) con corpo vuoto Astro lo rimanda alla pagina di errore tenendo gli header
  // della risposta originale (core/routing/handler.js, REROUTABLE_STATUS_CODES): con il CSP del
  // middleware, senza script-src, la pagina 404 arrivava con gli script bloccati (misurato sulla
  // preview: 7 violazioni). La pagina di errore porta il suo CSP hashato.
  it('404 vuoto rimandato alla pagina di errore: nessun CSP dal middleware', async () => {
    const next = async () => new Response(null, { status: 404 });
    const res = (await onRequest(ctx('/pagina-inesistente'), next)) as Response;
    expect(res.headers.get('Content-Security-Policy')).toBeNull();
  });

  it('pagina con il CSP di Astro: il middleware non lo sovrascrive', async () => {
    const astroCsp = "default-src 'self'; script-src 'self' 'sha256-abc'";
    const next = async () =>
      new Response('<html>', { headers: { 'Content-Security-Policy': astroCsp } });
    const res = (await onRequest(ctx('/servizi'), next)) as Response;
    expect(res.headers.get('Content-Security-Policy')).toBe(astroCsp);
  });

  // Bug di Astro in dev: dettagli in src/middleware.ts.
  it('in dev la risposta esce senza CSP', async () => {
    vi.stubEnv('DEV', true);
    const next = async () =>
      new Response('<html>', { headers: { 'Content-Security-Policy': "style-src 'self'" } });
    const res = (await onRequest(ctx('/'), next)) as Response;
    expect(res.headers.get('Content-Security-Policy')).toBeNull();
  });
});
