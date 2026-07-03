import { Frequency, UrlAssertionBuilder, UrlMonitor } from 'checkly/constructs';
import { websiteGroup } from './groups.check';

// Monitoraggio errori: verifica che le pagine chiave rispondano 200.
// Se una pagina inizia a restituire 4xx/5xx, Checkly invia un alert.
// Frequenza a 6 ore per contenere i consumi del free tier: solo i percorsi
// critici restano brevi (homepage uptime 10m, API preventivi 30m); queste
// pagine cambiano stato raramente e 6 ore di rilevamento sono adeguate.

const baseUrl = 'https://vetreriamonferrina.com';

const keyPages = [
  { id: 'servizi', path: '/servizi', name: 'Servizi' },
  { id: 'preventivo', path: '/preventivo', name: 'Preventivo' },
  { id: 'contatti', path: '/contatti', name: 'Contatti' },
  { id: 'chi-siamo', path: '/chi-siamo', name: 'Chi siamo' },
  { id: 'galleria', path: '/galleria', name: 'Galleria' },
  { id: 'faq', path: '/faq', name: 'FAQ' },
];

for (const page of keyPages) {
  new UrlMonitor(`page-${page.id}`, {
    name: `Pagina: ${page.name}`,
    group: websiteGroup,
    activated: true,
    frequency: Frequency.EVERY_6H,
    maxResponseTime: 10000,
    degradedResponseTime: 5000,
    request: {
      url: `${baseUrl}${page.path}`,
      followRedirects: true,
      assertions: [UrlAssertionBuilder.statusCode().equals(200)],
    },
  });
}

// Verifica che il sitemap sia raggiungibile.
// Con followRedirects valida anche il redirect 301 /sitemap.xml -> /sitemap-index.xml,
// così un'eventuale regressione SEO/AEO viene rilevata.
new UrlMonitor('sitemap-availability', {
  name: 'Sitemap raggiungibile',
  group: websiteGroup,
  activated: true,
  frequency: Frequency.EVERY_1H,
  maxResponseTime: 10000,
  degradedResponseTime: 5000,
  request: {
    url: `${baseUrl}/sitemap.xml`,
    followRedirects: true,
    assertions: [UrlAssertionBuilder.statusCode().equals(200)],
  },
});
