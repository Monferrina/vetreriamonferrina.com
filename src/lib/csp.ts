import { createHash } from 'node:crypto';

// Direttive CSP comuni a tutte le risposte del sito. Sono le stesse che stavano in vercel.json,
// senza script-src e style-src: quelle le genera Astro (security.csp) pagina per pagina, con
// gli hash degli script e degli stili inline. Un secondo CSP in vercel.json con `default-src
// 'self'` avrebbe bloccato comunque gli script inline hashati: più policy si sommano (MDN).
export const cspDirectives = [
  "default-src 'self'",
  "img-src 'self' data:",
  "font-src 'self'",
  // Host di ingest dell'org Sentry (regione UE), non *.ingest.de.sentry.io: il wildcard aprirebbe
  // un canale d'uscita verso qualunque org Sentry. Senza, il browser blocca gli invii degli errori.
  // Il meteo passa da /api/meteo (stesso dominio): nessun servizio meteo qui.
  "connect-src 'self' https://o4512180292878336.ingest.de.sentry.io",
  'frame-src https://www.google.com',
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
];

// Header per le risposte on demand (middleware): le pagine statiche hanno il loro da Astro.
export const cspHeader = cspDirectives.join('; ');

// Tema prima del primo paint: deve restare inline in <head>, prima del CSS. Astro non hasha
// gli script is:inline (misurato, CSP1): l'hash lo dichiariamo noi, dalla stessa stringa, così
// non può divergere dal contenuto. I blocchi ld+json non servono: il browser non li esegue.
export const themeScript = `(function () {
  const h = new Date().getHours();
  const dark = window.matchMedia('(prefers-color-scheme: dark)').matches || h >= 20 || h < 7;
  if (dark) document.documentElement.setAttribute('data-theme', 'dark');
})();`;

export const themeScriptHash =
  `sha256-${createHash('sha256').update(themeScript).digest('base64')}` as const;
