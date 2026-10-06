// Opzioni dell'SDK Sentry. Oggi gira solo nel browser (server spento in astro.config.mjs), ma
// le voci server restano impostate per quando il server verrà acceso.
// Regola: nessun dato personale verso Sentry.
// Il sito tratta nome, email e telefono nel modulo preventivi, e la privacy policy
// dichiara che i rapporti d'errore non contengono né l'IP né i dati del modulo.
// In @sentry/* 11 ogni voce di dataCollection è attiva di default. Qui sono spente tutte quelle
// che possono portare dati del visitatore; restano ai default solo graphQL, genAI,
// databaseQueryData e queues (il sito non usa quelle integrazioni) e frameContextLines (righe di
// codice sorgente, non dati).
export const sentryOptions = {
  dsn: 'https://8e0c585416092c688c12138e25763318@o4512180292878336.ingest.de.sentry.io/4512180302446672',
  dataCollection: {
    userInfo: false,
    cookies: false,
    // Deve restare false: X-Forwarded-For porta l'IP anche con userInfo spento, e il Worker
    // Cloudflare timbra ogni richiesta con x-origin-verify, il segreto dell'origin lockdown.
    // Con gli header attivi il segreto finirebbe in ogni evento server.
    httpHeaders: false,
    httpBodies: [], // il POST di send-quote contiene i dati del modulo
    urlQueryParams: false,
    stackFrameVariables: false, // in send-quote le variabili locali sono nome, email, telefono
  },
  // Breadcrumbs registra le navigazioni e le richieste fetch con l'URL intero, query compresa
  // (il GET del form senza JS porta nome, email e telefono), e il testo dei click; Console i
  // messaggi della console. Le integrazioni vanno tolte, non solo svuotate: con il solo
  // maxBreadcrumbs: 0 intercettano comunque console, fetch e click. BrowserSession
  // manderebbe una richiesta a Sentry a ogni pagina vista.
  integrations: <I extends { name: string }>(defaults: I[]): I[] =>
    defaults.filter((i) => !['Breadcrumbs', 'Console', 'BrowserSession'].includes(i.name)),
  maxBreadcrumbs: 0,
  // urlQueryParams non tocca request.url: il browser lo manda con la query string, e il form
  // preventivi senza JS fa un GET con nome, email e telefono nell'URL. Lo stesso URL compare
  // nei frame degli script inline, nel testo degli errori (location.href, URL relativi) e in
  // extra.__serialized__ quando si rifiuta una Promise con un oggetto (misurato sulla build di
  // produzione): per questo si ripuliscono tutte le stringhe dell'evento, non campi scelti.
  beforeSend<E extends object>(event: E): E {
    return scrub(event);
  },
};

// L'evento arriva già normalizzato dall'SDK (normalizeDepth), quindi senza cicli.
function scrub<T>(value: T): T {
  if (typeof value === 'string') return stripQueries(value) as T;
  if (Array.isArray(value)) return value.map(scrub) as T;
  if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) (value as Record<string, unknown>)[k] = scrub(v);
  }
  return value;
}

// Ogni URL, assoluto o relativo, perde query e frammento; il resto del testo resta com'è.
function stripQueries(text: string): string {
  return text.replace(/((?:https?:\/\/|\/)[^\s?#'"`]*)[?#][^\s'"`]*/g, '$1');
}
