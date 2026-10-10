import { ApiCheck, AssertionBuilder, Frequency } from 'checkly/constructs';
import { websiteGroup } from './groups.check';

// /api/meteo dal dominio pubblico, come la chiama il widget (passa da Cloudflare e dal Worker,
// che timbra x-origin-verify). Solo lettura, nessun effetto. Controlla i campi che il widget
// usa e che il CORS resti chiuso sul dominio del sito (vercel.json), mai `*`.
// Senza tag `preview`: presuppone la rotta già in produzione; il primo run lo fa
// `checkly deploy` dopo il deploy di produzione (checkly.yml).
new ApiCheck('meteo-api', {
  name: 'Meteo API',
  group: websiteGroup,
  activated: true,
  frequency: Frequency.EVERY_30M,
  degradedResponseTime: 3000,
  maxResponseTime: 10000,
  request: {
    url: 'https://vetreriamonferrina.com/api/meteo',
    method: 'GET',
    followRedirects: false,
    skipSSL: false,
    assertions: [
      AssertionBuilder.statusCode().equals(200),
      AssertionBuilder.headers('content-type').equals('application/json; charset=utf-8'),
      AssertionBuilder.headers('access-control-allow-origin').equals(
        'https://vetreriamonferrina.com'
      ),
      AssertionBuilder.jsonBody('$.temperatura').isNotNull(),
      AssertionBuilder.jsonBody('$.descrizione').isNotNull(),
      AssertionBuilder.jsonBody('$.icona').isNotNull(),
    ],
  },
  runParallel: false,
});
