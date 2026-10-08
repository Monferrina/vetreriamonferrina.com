// Seam B2 (Z1): verifica lato server del token Turnstile, con fetch iniettato: nessuna rete.
import { describe, expect, it, vi } from 'vitest';
import {
  TURNSTILE_TEST_SECRET,
  TURNSTILE_TEST_SITEKEY,
  turnstileServerConfig,
  turnstileSiteKey,
  verifyTurnstile,
  type TurnstileConfig,
} from '../../src/lib/turnstile';

const produzione: TurnstileConfig = { secret: 'segreto-vero', hostname: 'vetreriamonferrina.com' };

describe('verifyTurnstile', () => {
  it('token assente, non stringa, vuoto o oltre 2048 caratteri: invalid senza chiamare la rete', async () => {
    const fetchFn = vi.fn();
    for (const token of [undefined, null, 5, '', 'x'.repeat(2049)]) {
      expect(await verifyTurnstile(token, produzione, fetchFn)).toEqual({ kind: 'invalid' });
    }
    expect(fetchFn).not.toHaveBeenCalled();
  });
});

// Risposta finta di siteverify. Con un corpo non JSON, res.json() rifiuta come farebbe fetch.
function risponde(status: number, body: unknown) {
  return vi.fn(async () => new Response(JSON.stringify(body), { status }));
}

describe('verifyTurnstile: risposte di siteverify', () => {
  it('manda secret e token a siteverify come form, con timeout', async () => {
    const fetchFn = risponde(200, {
      success: true,
      hostname: 'vetreriamonferrina.com',
      action: 'send-quote',
    });
    expect(await verifyTurnstile('tok', produzione, fetchFn)).toEqual({ kind: 'ok' });
    const [url, init] = fetchFn.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://challenges.cloudflare.com/turnstile/v0/siteverify');
    expect(init.method).toBe('POST');
    expect(String(init.body)).toBe('secret=segreto-vero&response=tok');
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  it('codici provocati dal token (invalid-input-response, timeout-or-duplicate): invalid', async () => {
    for (const code of ['invalid-input-response', 'timeout-or-duplicate']) {
      const fetchFn = risponde(200, { success: false, 'error-codes': [code] });
      expect(await verifyTurnstile('tok', produzione, fetchFn)).toEqual({ kind: 'invalid' });
    }
  });

  it('segreto assente in produzione: unavailable senza chiamare la rete', async () => {
    const fetchFn = vi.fn();
    expect(await verifyTurnstile('tok', { ...produzione, secret: '' }, fetchFn)).toEqual({
      kind: 'unavailable',
      code: 'secret assente',
    });
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it('rete, timeout, HTTP diverso da 200, JSON rotto, internal-error, errori sul secret: unavailable', async () => {
    const casi: [typeof fetch, string][] = [
      [
        vi.fn(async () => {
          throw new TypeError('fetch failed');
        }) as unknown as typeof fetch,
        'TypeError',
      ],
      [
        vi.fn(async () => {
          throw new DOMException('t', 'TimeoutError');
        }) as unknown as typeof fetch,
        'TimeoutError',
      ],
      [risponde(502, {}) as unknown as typeof fetch, 'HTTP 502'],
      [
        vi.fn(async () => new Response('<html>', { status: 200 })) as unknown as typeof fetch,
        'SyntaxError',
      ],
      [
        risponde(200, {
          success: false,
          'error-codes': ['internal-error'],
        }) as unknown as typeof fetch,
        'internal-error',
      ],
      [
        risponde(200, {
          success: false,
          'error-codes': ['invalid-input-secret'],
        }) as unknown as typeof fetch,
        'invalid-input-secret',
      ],
      [risponde(200, { success: false }) as unknown as typeof fetch, 'risposta senza codici'],
    ];
    for (const [fetchFn, code] of casi) {
      expect(await verifyTurnstile('tok', produzione, fetchFn)).toEqual({
        kind: 'unavailable',
        code,
      });
    }
  });
});

describe('verifyTurnstile: chiavi vere contro chiavi di test', () => {
  it('con le chiavi vere, hostname o action diversi: invalid, con una riga di log fissa', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    for (const risposta of [
      { success: true, hostname: 'altro.example', action: 'send-quote' },
      { success: true, hostname: 'vetreriamonferrina.com', action: 'login' },
    ]) {
      expect(await verifyTurnstile('tok', produzione, risponde(200, risposta))).toEqual({
        kind: 'invalid',
      });
    }
    expect(warn).toHaveBeenCalledWith('[turnstile] hostname o action non attesi');
    warn.mockRestore();
  });

  it('con le chiavi vere, una risposta con result_with_testing_key: unavailable (secret di test in produzione)', async () => {
    const fetchFn = risponde(200, {
      success: true,
      hostname: 'example.com',
      metadata: { result_with_testing_key: true },
    });
    expect(await verifyTurnstile('tok', produzione, fetchFn)).toEqual({
      kind: 'unavailable',
      code: 'chiave di test in produzione',
    });
  });

  it('con le chiavi di test (hostname null) un success basta: ok', async () => {
    const test: TurnstileConfig = { secret: '1x0000000000000000000000000000000AA', hostname: null };
    const fetchFn = risponde(200, {
      success: true,
      hostname: 'example.com',
      metadata: { result_with_testing_key: true },
    });
    expect(await verifyTurnstile('tok', test, fetchFn)).toEqual({ kind: 'ok' });
  });
});

// Seam B4: dove partono email vere si usano chiavi vere, dove si usano quelle di test non parte
// niente. Decisione di Marco (07/10/2026): "su questa invariante va un test".
describe('selezione delle chiavi Turnstile', () => {
  it('fuori produzione: secret e sitekey di test della doc, nessun confronto di hostname', () => {
    expect(turnstileServerConfig(false, 'segreto-vero', 'https://vetreriamonferrina.com')).toEqual({
      secret: TURNSTILE_TEST_SECRET,
      hostname: null,
    });
    expect(turnstileSiteKey(false, 'sitekey-vera')).toBe(TURNSTILE_TEST_SITEKEY);
  });

  it('in produzione: chiavi vere, hostname da SITE_URL, mai quelle di test', () => {
    const cfg = turnstileServerConfig(true, 'segreto-vero', 'https://vetreriamonferrina.com');
    expect(cfg).toEqual({ secret: 'segreto-vero', hostname: 'vetreriamonferrina.com' });
    expect(turnstileSiteKey(true, 'sitekey-vera')).toBe('sitekey-vera');
  });

  it('in produzione senza secret: secret vuoto, che la verifica rifiuta (503), non quello di test', async () => {
    const cfg = turnstileServerConfig(true, undefined, 'https://vetreriamonferrina.com');
    expect(cfg.secret).toBe('');
    expect(await verifyTurnstile('tok', cfg, vi.fn())).toEqual({
      kind: 'unavailable',
      code: 'secret assente',
    });
    expect(turnstileSiteKey(true, undefined)).toBe('');
  });
});
