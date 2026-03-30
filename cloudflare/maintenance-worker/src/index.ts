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

const ORIGIN = 'https://vetreriamonferrina.vercel.app';

async function passthrough(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const originUrl = `${ORIGIN}${url.pathname}${url.search}`;
  const originRequest = new Request(originUrl, {
    method: request.method,
    headers: request.headers,
    body: request.body,
    redirect: 'follow',
  });
  const response = await fetch(originRequest);
  const headers = new Headers(response.headers);
  headers.set('x-maintenance', 'off');
  headers.set('x-worker', 'active');
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      if (env.MAINTENANCE_ENABLED !== 'true') {
        return await passthrough(request);
      }

      const url = new URL(request.url);
      const path = url.pathname;

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
        return await passthrough(request);
      }

      if (path.startsWith('/api/')) {
        return new Response(JSON.stringify({ error: 'Sito in manutenzione. Riprova più tardi.' }), {
          status: 503,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '3600',
          },
        });
      }

      const maintenanceResponse = await fetch(`${ORIGIN}/maintenance`);
      return new Response(maintenanceResponse.body, {
        status: 503,
        headers: {
          'Content-Type': 'text/html;charset=UTF-8',
          'Retry-After': '3600',
          'Cache-Control': 'no-store',
          'x-maintenance': 'on',
          'x-worker': 'active',
        },
      });
    } catch {
      return new Response('Servizio temporaneamente non disponibile.', {
        status: 502,
        headers: {
          'Content-Type': 'text/plain;charset=UTF-8',
          'Retry-After': '60',
        },
      });
    }
  },
};
