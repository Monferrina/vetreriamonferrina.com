// @vitest-environment node
import { afterEach, describe, expect, test, vi } from 'vitest';
import worker from '../../cloudflare/maintenance-worker/src/index';

// Con Vercel Authentication su tutte le deployment (AL1) l'origin risponde con il login
// Vercel a chi non porta il bypass: se il Worker non lo mette, il sito pubblico va giù.
const env = {
  MAINTENANCE_ENABLED: 'false',
  ORIGIN_VERIFY_SECRET: 'origin-secret',
  VERCEL_AUTOMATION_BYPASS_SECRET: 'bypass-secret',
};

function originFetch(headers: HeadersInit = {}) {
  const calls: Request[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      calls.push(new Request(input, init));
      return new Response('ok', { status: 200, headers });
    })
  );
  return calls;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('maintenance-worker, bypass della Vercel Authentication', () => {
  test('il passthrough manda il bypass e sovrascrive quello del client', async () => {
    const calls = originFetch();
    await worker.fetch(
      new Request('https://vetreriamonferrina.com/contatti', {
        headers: { 'x-vercel-protection-bypass': 'falso' },
      }),
      env
    );
    expect(calls).toHaveLength(1);
    expect(calls[0].headers.get('x-vercel-protection-bypass')).toBe('bypass-secret');
  });

  // F1 (Z1, 07/10/2026): Vercel risponde con Set-Cookie _vercel_jwt a chi manda
  // x-vercel-set-bypass-cookie insieme al bypass vero; il Worker lo consegnava al visitatore,
  // che con quel cookie apriva l'alias vercel.app saltando Cloudflare.
  test('nessun cookie dell origine arriva al visitatore', async () => {
    originFetch({ 'set-cookie': '_vercel_jwt=x; Path=/; HttpOnly' });
    const res = await worker.fetch(new Request('https://vetreriamonferrina.com/'), env);
    expect(res.headers.get('set-cookie')).toBeNull();
  });

  test('gli header x-vercel-* del visitatore non arrivano all origine', async () => {
    const calls = originFetch();
    await worker.fetch(
      new Request('https://vetreriamonferrina.com/', {
        headers: { 'X-Vercel-Set-Bypass-Cookie': 'true', 'x-vercel-skip-toolbar': '1' },
      }),
      env
    );
    expect(calls[0].headers.get('x-vercel-set-bypass-cookie')).toBeNull();
    expect(calls[0].headers.get('x-vercel-skip-toolbar')).toBeNull();
    expect(calls[0].headers.get('x-vercel-protection-bypass')).toBe('bypass-secret');
  });

  test('i parametri x-vercel-* della query non arrivano all origine', async () => {
    const calls = originFetch();
    for (const query of [
      '?x-vercel-set-bypass-cookie=true&a=1',
      '?a=1&X-VERCEL-SET-BYPASS-COOKIE=samesitenone',
      '?x%2Dvercel-set-bypass-cookie=true&a=1',
      '?a=1&x-vercel-protection-bypass=falso',
    ]) {
      await worker.fetch(new Request(`https://vetreriamonferrina.com/${query}`), env);
    }
    for (const call of calls) {
      expect(new URL(call.url).search).toBe('?a=1');
    }
  });

  test('una query senza x-vercel-* arriva all origine identica', async () => {
    const calls = originFetch();
    await worker.fetch(
      new Request('https://vetreriamonferrina.com/blog?q=vetro%20temperato&p=2'),
      env
    );
    expect(calls[0].url).toBe('https://vetreriamonferrina.vercel.app/blog?q=vetro%20temperato&p=2');
  });

  test('togliendo un x-vercel-* gli altri parametri restano identici', async () => {
    const calls = originFetch();
    await worker.fetch(
      new Request(
        'https://vetreriamonferrina.com/blog?q=vetro%20temperato&x-vercel-a=1&flag&t=a~b'
      ),
      env
    );
    expect(new URL(calls[0].url).search).toBe('?q=vetro%20temperato&flag&t=a~b');
  });

  // Il monitor Checkly chiede /?x-vercel-z1-sonda=1 (Vercel non lo conosce: nessun cookie
  // nemmeno se il filtro regredisce) e guarda questo header, mai un cookie col segreto.
  test('il Worker segnala quando ha tolto istruzioni x-vercel-*', async () => {
    originFetch();
    const filtrata = await worker.fetch(
      new Request('https://vetreriamonferrina.com/?x-vercel-z1-sonda=1'),
      env
    );
    expect(filtrata.headers.get('x-worker-filtered')).toBe('1');
    originFetch();
    const pulita = await worker.fetch(new Request('https://vetreriamonferrina.com/?a=1'), env);
    expect(pulita.headers.get('x-worker-filtered')).toBeNull();
  });

  test('anche la pagina di manutenzione viene chiesta con il bypass', async () => {
    const calls = originFetch();
    await worker.fetch(new Request('https://vetreriamonferrina.com/'), {
      ...env,
      MAINTENANCE_ENABLED: 'true',
    });
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe('https://vetreriamonferrina.vercel.app/maintenance');
    expect(calls[0].headers.get('x-vercel-protection-bypass')).toBe('bypass-secret');
  });
});
