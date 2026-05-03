import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// WINDOW_MS = 60_000, MAX_REQUESTS = 5, CLEANUP_INTERVAL = 5 * 60_000
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 5;
const CLEANUP_INTERVAL = 5 * 60_000;

describe('isRateLimited', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('permette le prime 5 richieste dallo stesso IP', async () => {
    const { isRateLimited } = await import('../../src/lib/rate-limit');
    const ip = '1.2.3.4';
    for (let i = 0; i < MAX_REQUESTS; i++) {
      expect(isRateLimited(ip)).toBe(false);
    }
  });

  it('blocca la sesta richiesta dallo stesso IP', async () => {
    const { isRateLimited } = await import('../../src/lib/rate-limit');
    const ip = '1.2.3.5';
    for (let i = 0; i < MAX_REQUESTS; i++) {
      isRateLimited(ip);
    }
    expect(isRateLimited(ip)).toBe(true);
  });

  it('IP diversi sono indipendenti', async () => {
    const { isRateLimited } = await import('../../src/lib/rate-limit');
    for (let i = 0; i < MAX_REQUESTS; i++) {
      isRateLimited('10.0.0.1');
    }
    expect(isRateLimited('10.0.0.2')).toBe(false);
  });

  it('sblocca le richieste dopo la scadenza della finestra temporale', async () => {
    const { isRateLimited } = await import('../../src/lib/rate-limit');
    const ip = '2.2.2.2';
    for (let i = 0; i < MAX_REQUESTS; i++) {
      isRateLimited(ip);
    }
    expect(isRateLimited(ip)).toBe(true);

    // Avanza di più di WINDOW_MS così i timestamp precedenti scadono
    vi.advanceTimersByTime(WINDOW_MS + 1);
    expect(isRateLimited(ip)).toBe(false);
  });

  it('il cleanup periodico rimuove IP con tutti i timestamp scaduti', async () => {
    const { isRateLimited } = await import('../../src/lib/rate-limit');

    // Pre-popola con 5 richieste al tempo t=0
    const staleIp = '3.3.3.3';
    for (let i = 0; i < MAX_REQUESTS; i++) {
      isRateLimited(staleIp);
    }

    // Avanza oltre CLEANUP_INTERVAL + WINDOW_MS: sia il cleanup sia i timestamp scadono
    vi.advanceTimersByTime(CLEANUP_INTERVAL + WINDOW_MS + 1);

    // Il cleanup viene triggerato dalla prossima chiamata a isRateLimited
    // I timestamp di staleIp sono fuori dalla finestra → l'IP viene rimosso dalla Map
    // La richiesta viene quindi accettata come se fosse la prima
    expect(isRateLimited(staleIp)).toBe(false);
  });

  it('il cleanup non interferisce con richieste registrate subito prima del check', async () => {
    const { isRateLimited } = await import('../../src/lib/rate-limit');

    // Avanza oltre CLEANUP_INTERVAL senza nessuna richiesta, così il prossimo
    // isRateLimited triggerà il cleanup con Map vuota
    vi.advanceTimersByTime(CLEANUP_INTERVAL + 1);

    // Ora registra MAX_REQUESTS richieste: passano tutte (cleanup non le tocca perché fresche)
    const ip = '4.4.4.4';
    for (let i = 0; i < MAX_REQUESTS; i++) {
      expect(isRateLimited(ip)).toBe(false);
    }

    // La sesta richiesta, immediatamente dopo, deve essere bloccata
    expect(isRateLimited(ip)).toBe(true);
  });
});
