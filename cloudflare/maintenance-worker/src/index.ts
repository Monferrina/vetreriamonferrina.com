/**
 * Cloudflare Worker — Maintenance Mode
 *
 * Intercepts all requests to vetreriamonferrina.com.
 * When MAINTENANCE_ENABLED=true, serves the /maintenance page with 503 status.
 * When MAINTENANCE_ENABLED=false, passes through to origin (Vercel).
 *
 * Toggle: Cloudflare Dashboard → Workers & Pages → maintenance-mode →
 *         Settings → Variables → MAINTENANCE_ENABLED
 *
 * @see https://developers.cloudflare.com/workers/
 */

interface Env {
  MAINTENANCE_ENABLED: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // When maintenance is OFF, pass through to origin (Vercel)
    if (env.MAINTENANCE_ENABLED !== 'true') {
      return fetch(request);
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // Let the maintenance page and its assets through to origin
    if (
      path === '/maintenance' ||
      path.startsWith('/_astro/') ||
      path.startsWith('/images/') ||
      path.startsWith('/fonts/') ||
      path.startsWith('/favicon') ||
      path.endsWith('.svg') ||
      path.endsWith('.png') ||
      path.endsWith('.webp') ||
      path.endsWith('.woff2') ||
      path.endsWith('.ico')
    ) {
      return fetch(request);
    }

    // API routes: return JSON 503
    if (path.startsWith('/api/')) {
      return new Response(JSON.stringify({ error: 'Sito in manutenzione. Riprova più tardi.' }), {
        status: 503,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': '3600',
        },
      });
    }

    // All other requests: fetch maintenance page from origin, serve as 503
    const maintenanceResponse = await fetch(new URL('/maintenance', url.origin).toString());

    return new Response(maintenanceResponse.body, {
      status: 503,
      headers: {
        'Content-Type': 'text/html;charset=UTF-8',
        'Retry-After': '3600',
        'Cache-Control': 'no-store',
      },
    });
  },
};
