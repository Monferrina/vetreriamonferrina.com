// Opzioni dell'SDK Sentry per il browser (sentry.config.ts).
// Regola: nessun dato personale verso Sentry: la privacy policy dichiara che i rapporti
// d'errore non contengono l'IP.
// In @sentry/* 11 ogni voce di dataCollection è attiva di default. Qui sono spente tutte quelle
// che possono portare dati del visitatore; restano ai default solo graphQL, genAI,
// databaseQueryData e queues (il sito non usa quelle integrazioni) e frameContextLines (righe di
// codice sorgente, non dati).
export const sentryOptions = {
  dsn: 'https://5980b0a6c1d33cfe07af58afa543cc6c@o4512180292878336.ingest.de.sentry.io/4512180302446672',
  dataCollection: {
    userInfo: false,
    cookies: false,
    // Deve restare false: X-Forwarded-For porta l'IP anche con userInfo spento.
    httpHeaders: false,
    httpBodies: [],
    urlQueryParams: false,
    stackFrameVariables: false,
  },
  // Breadcrumbs registra le navigazioni e le richieste fetch con l'URL intero, query compresa
  // (un URL con dati personali in query, come il vecchio GET del form senza JS, e' sempre
  // possibile da un link esterno), e il testo dei click; Console i
  // messaggi della console. Le integrazioni vanno tolte, non solo svuotate: con il solo
  // maxBreadcrumbs: 0 intercettano comunque console, fetch e click. BrowserSession
  // manderebbe una richiesta a Sentry a ogni pagina vista.
  integrations: <I extends { name: string }>(defaults: I[]): I[] =>
    defaults.filter((i) => !['Breadcrumbs', 'Console', 'BrowserSession'].includes(i.name)),
  maxBreadcrumbs: 0,
  // urlQueryParams non tocca request.url: il browser lo manda con la query string, che puo'
  // contenere dati personali (fino a F1 il form senza JS faceva un GET con nome, email e
  // telefono, e un vecchio link resta in giro). Lo stesso URL compare
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
