const requests = new Map<string, number[]>();
const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 5; // 5 per minute per IP
const CLEANUP_INTERVAL = 5 * 60_000; // cleanup every 5 minutes
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

export function isRateLimited(ip: string): boolean {
  const now = Date.now();

  // Periodic cleanup to prevent unbounded Map growth
  if (now - lastCleanup > CLEANUP_INTERVAL) {
    cleanup(now);
  }

  const timestamps = requests.get(ip) ?? [];
  const recent = timestamps.filter((t) => now - t < WINDOW_MS);

  if (recent.length >= MAX_REQUESTS) return true;

  recent.push(now);
  requests.set(ip, recent);
  return false;
}
