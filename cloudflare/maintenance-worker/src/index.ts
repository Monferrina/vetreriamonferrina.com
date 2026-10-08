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
 * Vercel Authentication: l'origin risponde con il login Vercel a chi arriva senza
 * `x-vercel-protection-bypass` (VERCEL_AUTOMATION_BYPASS_SECRET); dove vive il valore e
 * come si ruota sta nel README della repo, sezione "Vercel Authentication".
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
  VERCEL_AUTOMATION_BYPASS_SECRET: string;
}

const ORIGIN = 'https://vetreriamonferrina.vercel.app';

// Security header per le risposte generate DAL worker (503 manutenzione, 502):
// le risposte dell'origin li hanno già da vercel.json, queste no (finding Low
// audit 13/7). CSP allineata a quella del sito (la pagina manutenzione usa gli
// stessi asset/_astro e stili inline).
const SECURITY_HEADERS: Record<string, string> = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
};

// Header che l'origin pretende su ogni richiesta: senza il lockdown il middleware risponde
// 403 sull'API, senza il bypass Vercel risponde con il login. In un posto solo perché il
// fetch della pagina di manutenzione ne ha bisogno quanto il passthrough.
function originAuth(env: Env): Record<string, string> {
  return {
    'x-origin-verify': env.ORIGIN_VERIFY_SECRET,
    'x-vercel-protection-bypass': env.VERCEL_AUTOMATION_BYPASS_SECRET,
  };
}

// Gli x-vercel-* sono istruzioni per Vercel: dal visitatore, accanto al nostro bypass,
// valevano come nostre (x-vercel-set-bypass-cookie → cookie con dentro il segreto, Z1 F1).
// Vercel le accetta come header e come parametro della query (doc Protection Bypass for
// Automation): nome confrontato decodificato, senza spazi, in minuscolo.
const isVercelInstruction = (name: string) => /^x-vercel-/i.test(name.trim());

async function passthrough(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  // Coppie grezze, non searchParams: searchParams.delete() riscrive tutta la query
  // (%20 → +, flag → flag=), e l'origin riceverebbe parametri diversi da quelli inviati.
  const pairs = url.search.slice(1).split('&');
  const kept = pairs.filter(
    (pair) => ![...new URLSearchParams(pair).keys()].some(isVercelInstruction)
  );
  const search =
    kept.length === pairs.length ? url.search : kept.length ? `?${kept.join('&')}` : '';
  const originUrl = `${ORIGIN}${url.pathname}${search}`;

  // Copia mutabile degli header + timbri segreti. `.set()` (non `.append()`) sovrascrive
  // un eventuale valore falso mandato dal client → sul path CF è airtight.
  const originHeaders = new Headers(request.headers);
  // Chiavi raccolte prima: Headers non va modificato mentre lo si itera.
  const vercelHeaders = [...originHeaders.keys()].filter(isVercelInstruction);
  for (const name of vercelHeaders) {
    originHeaders.delete(name);
  }
  const filtered = search !== url.search || vercelHeaders.length > 0;
  for (const [name, value] of Object.entries(originAuth(env))) {
    originHeaders.set(name, value);
  }

  // redirect: 'manual' — i 3xx dell'origin (trailing-slash, sitemap, vecchi
  // /images/*) devono arrivare al client come redirect veri. Con 'follow' il
  // worker li seguiva e li mascherava da 200 (duplicate content + header
  // sensibili inoltrati alla destinazione, sconsigliato dalla doc CF).
  const originRequest = new Request(originUrl, {
    method: request.method,
    headers: originHeaders,
    body: request.body,
    redirect: 'manual',
  });
  const response = await fetch(originRequest);
  const headers = new Headers(response.headers);
  // Il sito non imposta cookie: l'unico che l'origin può mandare è il _vercel_jwt di
  // Vercel Authentication, coniato col nostro bypass. Consegnato al visitatore apriva
  // l'alias vercel.app per 7 giorni, saltando Worker, WAF e manutenzione (Z1, F1).
  headers.delete('set-cookie');

  // Le Location dell'origin (*.vercel.app, o relative) non devono trapelare:
  // riscritte sullo host pubblico richiesto dal client. Confronto sull'origin
  // parsato, non startsWith (che matcherebbe anche vercel.app.evil.com).
  const location = headers.get('location');
  if (location) {
    try {
      const locUrl = new URL(location, originUrl);
      if (locUrl.origin === ORIGIN) {
        headers.set('location', `${url.origin}${locUrl.pathname}${locUrl.search}${locUrl.hash}`);
      }
    } catch {
      // Location non parsabile: lasciata invariata
    }
  }

  // HSTS su ogni risposta in uscita dal worker (Vercel lo mette sulle sue,
  // ma non su tutte le 3xx; copre anche www, segnalato da CF come senza HSTS).
  if (!headers.has('strict-transport-security')) {
    headers.set('strict-transport-security', SECURITY_HEADERS['Strict-Transport-Security']);
  }

  headers.set('x-maintenance', 'off');
  headers.set('x-worker', 'active');
  // Per il monitor Checkly worker-filters-vercel-instructions: prova che il filtro gira
  // senza che il check debba mai vedere un cookie di bypass (che conterrebbe il segreto).
  if (filtered) headers.set('x-worker-filtered', '1');
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
            ...SECURITY_HEADERS,
            'Content-Type': 'application/json',
            'Retry-After': '3600',
          },
        });
      }

      // Anche il fetch della pagina di manutenzione passa dall'origin lockdown: senza il
      // segreto il middleware la 403-erebbe e la pagina di manutenzione risulterebbe rotta.
      const maintenanceResponse = await fetch(`${ORIGIN}/maintenance`, {
        headers: originAuth(env),
      });
      return new Response(maintenanceResponse.body, {
        status: 503,
        headers: {
          ...SECURITY_HEADERS,
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
          ...SECURITY_HEADERS,
          'Content-Type': 'text/plain;charset=UTF-8',
          'Retry-After': '60',
        },
      });
    }
  },
};
