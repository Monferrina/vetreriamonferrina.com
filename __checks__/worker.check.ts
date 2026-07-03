import { ApiCheck, AssertionBuilder } from 'checkly/constructs';
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
