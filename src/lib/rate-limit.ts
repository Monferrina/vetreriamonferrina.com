import process from 'node:process';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const MAX_REQUESTS = 5; // 5 per minute per IP
const WINDOW = '60 s';

// Global limiter backed by Upstash Redis when configured (production/preview) — shared
// across all serverless instances. Falls back to the in-memory limiter below when the
// Upstash env vars are absent (local dev / CI / tests), so those paths need no network.
// Read from process.env (not astro:env/server) so this module also loads under Vitest.
const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

const ratelimit =
  upstashUrl && upstashToken
    ? new Ratelimit({
        redis: new Redis({ url: upstashUrl, token: upstashToken }),
        limiter: Ratelimit.slidingWindow(MAX_REQUESTS, WINDOW),
        prefix: 'rl:quote',
      })
    : null;

// Fail-open dichiarato: senza Upstash in produzione il limite torna per-istanza
// (5/min × N lambda), lo stato pre-#223. Il fallback resta, ma deve urlare nei log.
// VERCEL_ENV distingue production da preview (NODE_ENV è 'production' su entrambi).
if (!ratelimit && (process.env.VERCEL_ENV || process.env.NODE_ENV) === 'production') {
  console.error(
    '[rate-limit] UPSTASH_REDIS_REST_URL/TOKEN assenti in produzione: ' +
      'fallback in-memory per-istanza, il limite globale NON è attivo.'
  );
}

// --- in-memory fallback ---
// ponytail: per-instance counter (best-effort). Only the fallback path; production uses
// Upstash for a global limit. Fine for dev/CI and low-traffic no-Upstash deploys.
const WINDOW_MS = 60_000;
const CLEANUP_INTERVAL = 5 * 60_000;
const requests = new Map<string, number[]>();
let lastCleanup = Date.now();

function cleanup(now: number): void {
  for (const [ip, timestamps] of requests) {
    const recent = timestamps.filter((t) => now - t < WINDOW_MS);
    if (recent.length === 0) {
      requests.delete(ip);
    } else {
      requests.set(ip, recent);
    }
  }
  lastCleanup = now;
}

function isRateLimitedInMemory(ip: string): boolean {
  const now = Date.now();

  // Periodic cleanup to prevent unbounded Map growth
  if (now - lastCleanup > CLEANUP_INTERVAL) {
    cleanup(now);
  }

  const recent = (requests.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);

  if (recent.length >= MAX_REQUESTS) return true;

  recent.push(now);
  requests.set(ip, recent);
  return false;
}

// `limiter` defaults to the module-level Upstash instance; tests inject a fake to exercise
// the global path without a network call (same DI pattern as send-quote.ts's EmailSender).
export async function isRateLimited(
  ip: string,
  limiter: { limit: (id: string) => Promise<{ success: boolean }> } | null = ratelimit
): Promise<boolean> {
  if (limiter) {
    const { success } = await limiter.limit(ip);
    return !success;
  }
  return isRateLimitedInMemory(ip);
}
