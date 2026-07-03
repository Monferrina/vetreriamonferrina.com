/**
 * Cloudflare Worker — Maintenance Mode + Origin Lockdown
 *
 * Intercepts all requests to vetreriamonferrina.com.
 * When MAINTENANCE_ENABLED=true, serves the /maintenance page with 503 status.
 * When MAINTENANCE_ENABLED=false, passes through to origin (Vercel).
 *
 * Origin lockdown: ogni richiesta verso l'origin viene timbrata con l'header segreto
 * `x-origin-verify` (ORIGIN_VERIFY_SECRET). Il middleware Astro, in produzione, rifiuta
 * chi non ce l'ha → chi colpisce *.vercel.app diretto (bypassando CF) prende 403.
 *
 * Toggle manutenzione: Cloudflare Dashboard → Workers & Pages → maintenance-mode →
 *         Settings → Variabili e segreti → MAINTENANCE_ENABLED
 * Il secret ORIGIN_VERIFY_SECRET va aggiunto come Secret (runtime), stesso valore su Vercel.
 *
 * @see https://developers.cloudflare.com/workers/
 */

interface Env {
  MAINTENANCE_ENABLED: string;
  ORIGIN_VERIFY_SECRET: string;
}

const ORIGIN = 'https://vetreriamonferrina.vercel.app';

async function passthrough(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const originUrl = `${ORIGIN}${url.pathname}${url.search}`;

  // Copia mutabile degli header + timbro segreto. `.set()` (non `.append()`) sovrascrive
  // un eventuale x-origin-verify falso mandato dal client → sul path CF è airtight.
  const originHeaders = new Headers(request.headers);
  originHeaders.set('x-origin-verify', env.ORIGIN_VERIFY_SECRET);

  const originRequest = new Request(originUrl, {
    method: request.method,
    headers: originHeaders,
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
        return await passthrough(request, env);
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
        return await passthrough(request, env);
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

      // Anche il fetch della pagina di manutenzione passa dall'origin lockdown: senza il
      // segreto il middleware la 403-erebbe e la pagina di manutenzione risulterebbe rotta.
      const maintenanceResponse = await fetch(`${ORIGIN}/maintenance`, {
        headers: { 'x-origin-verify': env.ORIGIN_VERIFY_SECRET },
      });
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
