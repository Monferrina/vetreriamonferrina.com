import process from 'node:process';
import { defineMiddleware } from 'astro:middleware';
import type { APIContext, MiddlewareNext } from 'astro';
import { cspHeader } from './lib/csp';

export const onRequest = defineMiddleware(async (context, next) => {
  const response = await guard(context, next);
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
  // di produzione (VERCEL_ENV=production, secret presente) ogni pagina verrebbe
  // compilata come "Forbidden" (le richieste interne di prerender non hanno l'header).
  // Le pagine statiche non hanno path /api/ → non entrano MAI nell'enforce → si
  // compilano correttamente. /api/send-quote è prerender=false → non prerenderata al
  // build → l'enforce scatta solo a runtime, su richieste reali.
  //
  // A runtime: chi colpisce *.vercel.app/api/... diretto (senza Worker → senza header)
  // prende 403. Il traffico via Cloudflare passa dal Worker che timbra x-origin-verify.
  // Fail-open: se il segreto non è configurato su Vercel, non blocca.
  const secret = process.env.ORIGIN_VERIFY_SECRET;
  if (
    context.url.pathname.startsWith('/api/') &&
    process.env.VERCEL_ENV === 'production' &&
    secret &&
    context.request.headers.get('x-origin-verify') !== secret
  ) {
    return new Response('Forbidden', { status: 403 });
  }
  return next();
};
