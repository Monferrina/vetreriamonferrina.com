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

function originFetch() {
  const calls: Request[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      calls.push(new Request(input, init));
      return new Response('ok', { status: 200 });
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
