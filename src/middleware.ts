import process from 'node:process';
import { createHash, timingSafeEqual } from 'node:crypto';
import { defineMiddleware } from 'astro:middleware';
import type { APIContext, MiddlewareNext } from 'astro';
import { cspHeader } from './lib/csp';

export const onRequest = defineMiddleware(async (context, next) => {
  const response = await guard(context, next);
  // In dev Astro 7.3.5 manda il CSP anche senza gli hash degli stili inline di Vite (node_modules/astro/dist/runtime/server/render/page.js:65,
  // `&&` senza parentesi con cspDestination "adapter"): il browser li bloccava e il sito restava
  // senza CSS in locale. La doc dice che in dev il CSP non c'è: qui si fa valere. Da togliere
  // quando page.js:65 avra' le parentesi (ancora sbagliato in 7.3.6 e 7.4.0-beta.1, 07/10/2026).
  if (import.meta.env.DEV) {
    if (!response.headers.has('Content-Security-Policy')) return response;
    // Copia: gli header di una Response da fetch() o Response.redirect() sono immutabili.
    const copy = new Response(response.body, response);
    copy.headers.delete('Content-Security-Policy');
    return copy;
  }
  // CSP per le risposte che Astro non copre (/api, _image, 403 di questo middleware). Le pagine
  // HTML lo hanno già da security.csp con gli hash degli script inline (render/page.js, destinazione
  // `adapter`): sovrascriverlo qui le lascerebbe con la sola default-src e gli script bloccati.
  // Stessa cosa per un 404/500 a corpo vuoto: Astro lo rimanda alla pagina di errore tenendo gli
  // header originali (core/routing/handler.js, REROUTABLE_STATUS_CODES), e la pagina porta il suo.
  const rerouted = response.body === null && [404, 500].includes(response.status);
  if (!rerouted && !response.headers.has('Content-Security-Policy')) {
    response.headers.set('Content-Security-Policy', cspHeader);
  }
  return response;
});

const guard = async (context: APIContext, next: MiddlewareNext): Promise<Response> => {
  // Origin lockdown — enforce SOLO sulle rotte /api/ (le uniche SSR).
  //
  // La guardia `/api/` è fondamentale: il middleware Astro gira ANCHE durante il
  // prerender al build delle pagine statiche. Senza il filtro sul path, in un build
  // di produzione (VERCEL_ENV=production, con o senza secret) ogni pagina verrebbe
  // compilata come "Forbidden" (le richieste interne di prerender non hanno l'header).
  // Le pagine statiche non hanno path /api/ → non entrano MAI nell'enforce → si
  // compilano correttamente. /api/send-quote è prerender=false → non prerenderata al
  // build → l'enforce scatta solo a runtime, su richieste reali.
  //
  // A runtime: chi colpisce *.vercel.app/api/... diretto (senza Worker → senza header)
  // prende 403. Il traffico via Cloudflare passa dal Worker che timbra x-origin-verify.
  // Fail-closed: segreto assente o vuoto su Vercel → 403 anche per il Worker, così il form
  // si ferma e Checkly lo vede, invece di restare aperto in silenzio con il rate limit
  // aggirabile da un cf-connecting-ip falsificato. Secondo strato dietro la Vercel
  // Authentication (README, "Vercel Authentication"). Dipende da VERCEL_ENV, cioè dalle
  // System Environment Variables esposte dal progetto Vercel (`autoExposeSystemEnvs`,
  // misurato true il 06/10/2026): un fallback su NODE_ENV chiuderebbe anche le preview.
  const secret = process.env.ORIGIN_VERIFY_SECRET;
  if (
    context.url.pathname.startsWith('/api/') &&
    process.env.VERCEL_ENV === 'production' &&
    (!secret || !sameSecret(context.request.headers.get('x-origin-verify') ?? '', secret))
  ) {
    return new Response('Forbidden', { status: 403 });
  }
  return next();
};

// Confronto a tempo costante (doc Node: timingSafeEqual "does not leak timing information").
// `!==` esce al primo byte diverso e offre un oracolo di tempo a chi prova il segreto
// byte per byte. timingSafeEqual lancia se le lunghezze differiscono (doc: "An error is
// thrown if a and b have different byte lengths"): si confrontano i digest SHA-256, sempre
// di 32 byte, così non serve un controllo di lunghezza che riveli quella del segreto.
const digest = (s: string) => createHash('sha256').update(s).digest();
const sameSecret = (provided: string, secret: string): boolean =>
  timingSafeEqual(digest(provided), digest(secret));
