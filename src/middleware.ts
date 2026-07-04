import process from 'node:process';
import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  // Origin lockdown: in produzione accetta solo il traffico che passa dal Worker Cloudflare
  // (che timbra x-origin-verify). Gli hit diretti a *.vercel.app non ce l'hanno → 403.
  // Con le pagine prerender=true il middleware gira solo sulle rotte SSR (oggi /api/send-quote),
  // che è dove il bypass conta davvero: salta WAF + rate-limit dell'API preventivi.
  // Fail-open: se il segreto non è configurato su Vercel, non blocca (deploy sicuro).
  const secret = process.env.ORIGIN_VERIFY_SECRET;
  if (
    process.env.VERCEL_ENV === 'production' &&
    secret &&
    context.request.headers.get('x-origin-verify') !== secret
  ) {
    return new Response('Forbidden', { status: 403 });
  }
  return next();
});
