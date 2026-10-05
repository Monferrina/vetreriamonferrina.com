import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Valori scritti qui e non importati da src: sono la specifica (5 richieste al minuto).
// Importati, un limite portato a 500 farebbe passare i test lo stesso.
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 5;

describe('isRateLimited', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('permette le prime 5 richieste dallo stesso IP', async () => {
    const { isRateLimited } = await import('../../src/lib/rate-limit');
    const ip = '1.2.3.4';
    for (let i = 0; i < MAX_REQUESTS; i++) {
      expect(await isRateLimited(ip)).toBe(false);
    }
  });

  it('blocca la sesta richiesta dallo stesso IP', async () => {
    const { isRateLimited } = await import('../../src/lib/rate-limit');
    const ip = '1.2.3.5';
    for (let i = 0; i < MAX_REQUESTS; i++) {
      await isRateLimited(ip);
    }
    expect(await isRateLimited(ip)).toBe(true);
  });

  it('IP diversi sono indipendenti', async () => {
    const { isRateLimited } = await import('../../src/lib/rate-limit');
    for (let i = 0; i < MAX_REQUESTS; i++) {
      await isRateLimited('10.0.0.1');
    }
    expect(await isRateLimited('10.0.0.2')).toBe(false);
  });

  it('sblocca le richieste dopo la scadenza della finestra temporale', async () => {
    const { isRateLimited } = await import('../../src/lib/rate-limit');
    const ip = '2.2.2.2';
    for (let i = 0; i < MAX_REQUESTS; i++) {
      await isRateLimited(ip);
    }
    expect(await isRateLimited(ip)).toBe(true);

    // Avanza di più di WINDOW_MS così i timestamp precedenti scadono
    vi.advanceTimersByTime(WINDOW_MS + 1);
    expect(await isRateLimited(ip)).toBe(false);
  });

  it('usa il limiter globale iniettato quando presente (path Upstash)', async () => {
    const { isRateLimited } = await import('../../src/lib/rate-limit');
    const blocked = { limit: async () => ({ success: false }) };
    const allowed = { limit: async () => ({ success: true }) };
    // success === false → limitato; success === true → passa. Nessuna rete: fake iniettato.
    expect(await isRateLimited('9.9.9.9', blocked)).toBe(true);
    expect(await isRateLimited('9.9.9.9', allowed)).toBe(false);
  });

  // Env stubbata esplicitamente (anche a '') così i test non dipendono da variabili
  // esportate nella shell (es. UPSTASH_* da `vercel env pull` o NODE_ENV in CI).
  it('in produzione senza Upstash segnala il fallback in-memory su console.error', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('VERCEL_ENV', 'production');
    vi.stubEnv('UPSTASH_REDIS_REST_URL', '');
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', '');
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    await import('../../src/lib/rate-limit');
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('[rate-limit]'));
  });

  it('fuori produzione (preview/dev/test) il fallback in-memory è silenzioso', async () => {
    vi.stubEnv('NODE_ENV', 'test');
    vi.stubEnv('VERCEL_ENV', '');
    vi.stubEnv('UPSTASH_REDIS_REST_URL', '');
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', '');
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    await import('../../src/lib/rate-limit');
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('il cleanup conserva gli IP con timestamp ancora validi', async () => {
    const { isRateLimited } = await import('../../src/lib/rate-limit');
    const ip = '5.5.5.5';

    // 5 richieste a t=270s, prima del primo cleanup (CLEANUP_INTERVAL = 300s)
    vi.advanceTimersByTime(270_000);
    for (let i = 0; i < MAX_REQUESTS; i++) {
      await isRateLimited(ip);
    }

    // A t=301s il check fa partire il cleanup; le 5 richieste (31s fa) sono ancora nella
    // finestra: se il cleanup cancellasse l'IP, la sesta passerebbe.
    vi.advanceTimersByTime(31_000);
    expect(await isRateLimited(ip)).toBe(true);
  });

  it('degrada sul fallback in-memory se il limiter globale lancia', async () => {
    // Upstash irraggiungibile (outage, token invalido, DNS): l'eccezione non deve
    // risalire fino alla route, o il form preventivo — unico canale di lead — muore.
    const { isRateLimited } = await import('../../src/lib/rate-limit');
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const rotto = { limit: () => Promise.reject(new Error('UpstashError')) };

    expect(await isRateLimited('7.7.7.7', rotto)).toBe(false);
    expect(errorSpy).toHaveBeenCalled();
  });
});
