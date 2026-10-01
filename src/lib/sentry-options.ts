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
  // I console.warn di send-quote scrivono l'IP: come breadcrumb finirebbero nell'evento.
  // Le integrazioni che li raccolgono vanno tolte, non solo svuotate: con il solo
  // maxBreadcrumbs: 0 intercettano comunque console, fetch e click. BrowserSession
  // manderebbe una richiesta a Sentry a ogni pagina vista.
  integrations: <I extends { name: string }>(defaults: I[]): I[] =>
    defaults.filter((i) => !['Breadcrumbs', 'Console', 'BrowserSession'].includes(i.name)),
  maxBreadcrumbs: 0,
  // urlQueryParams non tocca request.url: il browser lo manda con la query string, e il form
  // preventivi senza JS fa un GET con nome, email e telefono nell'URL. Lo stesso URL compare
  // come filename dei frame degli script inline (misurato sulla build di produzione) e può
  // comparire nel testo dell'errore (es. SecurityError della History API con location.href).
  beforeSend<E extends SentryEvent>(event: E): E {
    if (event.request?.url) event.request.url = stripQuery(event.request.url);
    if (event.message) event.message = stripQueriesInText(event.message);
    for (const value of event.exception?.values ?? []) {
      if (value.value) value.value = stripQueriesInText(value.value);
      for (const frame of value.stacktrace?.frames ?? []) {
        if (frame.filename) frame.filename = stripQuery(frame.filename);
        if (frame.abs_path) frame.abs_path = stripQuery(frame.abs_path);
      }
    }
    return event;
  },
};

type SentryEvent = {
  request?: { url?: string };
  message?: string;
  exception?: {
    values?: {
      value?: string;
      stacktrace?: { frames?: { filename?: string; abs_path?: string }[] };
    }[];
  };
};

function stripQuery(url: string): string {
  return url.split(/[?#]/)[0];
}

// Ogni URL dentro un testo libero perde query e frammento; il resto del testo resta com'è.
function stripQueriesInText(text: string): string {
  return text.replace(/(https?:\/\/[^\s?#'"]+)[?#][^\s'"]*/g, '$1');
}
