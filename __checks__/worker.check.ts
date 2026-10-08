import { ApiCheck, AssertionBuilder, Frequency } from 'checkly/constructs';
import { websiteGroup } from './groups.check';

// Verifica che il Worker Cloudflare sia davanti all'origin. Sul passthrough il worker
// timbra `x-worker: active` e `x-maintenance: off` (vedi cloudflare/maintenance-worker).
// Se il worker cadesse, venisse scollegato o la manutenzione restasse accesa per errore,
// questi header cambierebbero/sparirebbero → il check fallisce. Va DELIBERATAMENTE sul
// dominio (non sull'origin Vercel) perché è proprio il passaggio dal worker che vogliamo
// monitorare.
new ApiCheck('cloudflare-worker-active', {
  name: 'Cloudflare Worker Active',
  group: websiteGroup,
  activated: true,
  frequency: Frequency.EVERY_6H,
  degradedResponseTime: 5000,
  maxResponseTime: 10000,
  request: {
    url: 'https://vetreriamonferrina.com/',
    method: 'GET',
    followRedirects: true,
    skipSSL: false,
    assertions: [
      AssertionBuilder.statusCode().equals(200),
      AssertionBuilder.headers('x-worker').equals('active'),
      AssertionBuilder.headers('x-maintenance').equals('off'),
    ],
  },
  runParallel: true,
});

// Filtro delle istruzioni x-vercel-* del Worker (Z1 F1). Un x-vercel-set-bypass-cookie del
// visitatore faceva coniare a Vercel un _vercel_jwt che contiene il segreto di bypass: il check
// NON lo usa, perché a ogni fallimento il segreto finirebbe nel risultato Checkly e, sulle PR,
// nel log pubblico di GitHub Actions. Usa invece un x-vercel-* che Vercel non conosce
// (misurato 08/10/2026 col Worker vecchio: 200, nessun Set-Cookie) e guarda l'header con cui il
// Worker dichiara di averlo tolto. Il blocco dei Set-Cookie lo prova il test unitario.
new ApiCheck('worker-filters-vercel-instructions', {
  name: 'Cloudflare Worker: filtra le istruzioni x-vercel-* dei visitatori',
  group: websiteGroup,
  activated: true,
  frequency: Frequency.EVERY_6H,
  degradedResponseTime: 5000,
  maxResponseTime: 10000,
  request: {
    url: 'https://vetreriamonferrina.com/?x-vercel-z1-sonda=1',
    method: 'GET',
    followRedirects: false,
    skipSSL: false,
    assertions: [
      AssertionBuilder.statusCode().equals(200),
      AssertionBuilder.headers('x-worker-filtered').equals('1'),
    ],
  },
  runParallel: true,
});
