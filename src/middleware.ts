import { defineMiddleware } from 'astro:middleware';
import { cspHeader } from './lib/csp';

export const onRequest = defineMiddleware(async (_context, next) => {
  const response = await next();
  // In dev Astro 7.3.5 manda il CSP anche senza gli hash degli stili inline di Vite (node_modules/astro/dist/runtime/server/render/page.js:65,
  // `&&` senza parentesi con cspDestination "adapter"): il browser li bloccava e il sito restava
  // senza CSS in locale. La doc dice che in dev il CSP non c'è: qui si fa valere. Da togliere
  // quando page.js:65 avra' le parentesi (ancora sbagliato in 7.3.6 e 7.4.0-beta.1, 07/10/2026;
  // https://github.com/withastro/astro/issues/18285).
  if (import.meta.env.DEV) {
    if (!response.headers.has('Content-Security-Policy')) return response;
    // Copia: gli header di una Response da fetch() o Response.redirect() sono immutabili.
    const copy = new Response(response.body, response);
    copy.headers.delete('Content-Security-Policy');
    return copy;
  }
  // CSP per le risposte che Astro non copre (_image). Le pagine
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
