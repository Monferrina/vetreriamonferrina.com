import { ApiCheck, AssertionBuilder } from 'checkly/constructs';
import { websiteGroup } from './groups.check';

// Caso negativo dell'origin lockdown (M1, fail-closed): un POST diretto all'origin Vercel
// SENZA `x-origin-verify` deve ricevere il 403 "Forbidden" del middleware. Il check positivo
// (api.check.ts) manda sempre l'header e resta verde anche se il lockdown si spegne: questo
// è l'unico monitor che vede una regressione a fail-open.
//
// Email-safe per costruzione: il 403 del middleware precede l'handler, quindi nessun invio
// e nessun consumo del rate limit. Il bypass Vercel serve a superare la Vercel Authentication
// (altrimenti arriva la login, 302); l'Origin del sito distingue questo 403 (text/plain
// "Forbidden") da quello JSON dell'handler ("Origine non autorizzata").
//
// `shouldFail: true` è la forma documentata da Checkly per un check che attende un 4xx:
// "HTTP status codes 400 and above are reported as passed instead of failed"; le assertion
// pretendono esattamente 403 e il corpo del middleware. Misurato 06/10/2026 con l'header vero
// (regressione a fail-open simulata, 400 "Dati non validi"): il check FALLISCE, quindi
// shouldFail non inverte le assertion come lascerebbe pensare il JSDoc del construct. `Content-Type: application/json`
// serve: senza, Astro risponde prima del middleware con il suo 403 anti-CSRF ("Cross-site POST
// form submissions are forbidden.", misurato 06/10/2026). Doc `security.checkOrigin`: il controllo
// vale per i POST "with no content-type header" o con content-type da form, e qui l'Origin del
// sito non è l'host dell'alias. Niente corpo: non arriva all'handler, e in caso di regressione
// a fail-open l'handler risponde 400 senza email.
new ApiCheck('send-quote-lockdown', {
  name: 'Send Quote API lockdown (senza x-origin-verify → 403)',
  group: websiteGroup,
  activated: true,
  shouldFail: true,
  degradedResponseTime: 5000,
  maxResponseTime: 10000,
  request: {
    url: 'https://vetreriamonferrina.vercel.app/api/send-quote',
    method: 'POST',
    followRedirects: false,
    skipSSL: false,
    headers: [
      { key: 'Content-Type', value: 'application/json' },
      { key: 'Origin', value: 'https://vetreriamonferrina.com' },
      { key: 'x-vercel-protection-bypass', value: '{{VERCEL_AUTOMATION_BYPASS_SECRET}}' },
    ],
    assertions: [
      AssertionBuilder.statusCode().equals(403),
      AssertionBuilder.textBody().equals('Forbidden'),
    ],
  },
  runParallel: false,
});
