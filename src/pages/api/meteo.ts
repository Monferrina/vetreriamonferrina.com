import { email, latitude, longitude } from '../../data/contatti';
import { simboli } from '../../lib/meteo-simboli';
import { reportThrottled } from '../../lib/sentry-report';
// L'init di Sentry: l'integrazione non lo porta negli endpoint (astro.config.mjs).
import '../../../sentry.server.config';

export const prerender = false;

const MET_URL = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${latitude}&lon=${longitude}&altitude=116`;
// Termini MET (api.met.no/doc/TermsOfService): User-Agent con dominio e contatto, o 403.
const USER_AGENT = `vetreriamonferrina.com ${email}`;
// ASVS V4.1.1: Content-Type con il charset.
const JSON_UTF8 = 'application/json; charset=utf-8';

// OWASP API10:2023: i dati di MET si validano prima dell'uso. Fuori scala o di tipo sbagliato
// = risposta inattesa, quindi 502 (intervalli larghi: servono a scartare l'assurdo, non a
// giudicare il meteo).
function numero(v: unknown, min: number, max: number): number {
  if (typeof v !== 'number' || !Number.isFinite(v) || v < min || v > max) {
    throw new Error('MET: valore fuori schema');
  }
  return v;
}

// OWASP API10:2023, "limit the number of resources available to process third-party
// responses": il corpo si legge a pezzi e ci si ferma oltre 1 MB (la risposta vera è sulle
// decine di KB, misurato il 10/10/2026).
async function jsonLimitato(res: Response, max = 1_000_000): Promise<unknown> {
  const reader = res.body?.getReader();
  if (!reader) throw new Error('MET: risposta senza corpo');
  const decoder = new TextDecoder();
  let testo = '';
  let letti = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    letti += value.byteLength;
    if (letti > max) {
      await reader.cancel();
      throw new Error('MET: risposta troppo grande');
    }
    testo += decoder.decode(value, { stream: true });
  }
  return JSON.parse(testo + decoder.decode());
}

// Forma attesa (doc locationforecast/datamodel). Non è un controllo: se MET manda altro,
// l'accesso lancia o numero() rifiuta, e la risposta è 502.
type MetCompact = {
  properties: {
    timeseries: {
      data: {
        instant: { details: Record<string, unknown> };
        next_1_hours: { summary: { symbol_code: unknown } };
      };
    }[];
  };
};

// Termini MET: niente richieste nuove prima di Expires. Senza Expires valido, 60 s; un
// Expires assurdo non fissa il meteo per sempre: al massimo un'ora.
function scadenza(res: Response): number {
  const adesso = Date.now();
  const expires = Date.parse(res.headers.get('Expires') ?? '') || 0;
  return Math.min(Math.max(expires, adesso + 60_000), adesso + 3_600_000);
}

// Last-Modified di MET, normalizzata: torna a MET come If-Modified-Since, quindi niente di suo
// passa così com'è nell'header.
function modificata(res: Response): string | undefined {
  const ms = Date.parse(res.headers.get('Last-Modified') ?? '');
  return Number.isFinite(ms) ? new Date(ms).toUTCString() : undefined;
}

type Meteo = {
  dati: Record<string, number | string | boolean>;
  scade: number;
  modificata?: string;
};

async function leggiMet(precedente?: Meteo): Promise<Meteo> {
  // Limite di tempo e niente redirect seguiti (OWASP API10:2023: timeout, "do not blindly
  // follow redirects"; ASVS V13.1.3, V15.3.2).
  const res = await fetch(MET_URL, {
    // Termini MET: "Cache data locally and use the If-Modified-Since request header".
    headers: {
      'User-Agent': USER_AGENT,
      ...(precedente?.modificata && { 'If-Modified-Since': precedente.modificata }),
    },
    redirect: 'error',
    signal: AbortSignal.timeout(5000),
  });
  if (res.status === 304 && precedente) return { ...precedente, scade: scadenza(res) };
  if (!res.ok) {
    // X-ErrorClass: la causa secondo MET (doc locationforecast, "ErrorClass header"). Nel log
    // solo se è un nome semplice, per non far scrivere righe a MET (ASVS V16.4.1).
    const classe = res.headers.get('X-ErrorClass') ?? '';
    throw new Error(`MET HTTP ${res.status} ${/^[A-Za-z]{1,40}$/.test(classe) ? classe : '-'}`);
  }
  const ora = ((await jsonLimitato(res)) as MetCompact).properties.timeseries[0].data;
  const d = ora.instant.details;
  const simbolo = String(ora.next_1_hours.summary.symbol_code).replace(
    /_(day|night|polartwilight)$/,
    ''
  );
  // hasOwn: 'constructor' o '__proto__' non devono trovare il prototipo dell'oggetto.
  if (!Object.hasOwn(simboli, simbolo)) throw new Error('MET: simbolo fuori legenda');
  const [icona, descrizione] = simboli[simbolo];
  return {
    dati: {
      temperatura: Math.round(numero(d.air_temperature, -60, 60)),
      umidita: Math.round(numero(d.relative_humidity, 0, 100)),
      vento: Math.round(numero(d.wind_speed, 0, 100) * 3.6),
      icona,
      descrizione,
      pioggia: /rain|sleet|snow/.test(simbolo),
      temporale: simbolo.includes('thunder'),
    },
    scade: scadenza(res),
    modificata: modificata(res),
  };
}

// OWASP API4:2023: una sola chiamata a MET finché la risposta vale, condivisa anche dalle
// richieste contemporanee. La cache della CDN da sola si aggira con ?x=1, ?x=2…; questa no
// (per istanza della funzione: Fluid Compute le riusa).
let ultimo: Meteo | undefined;
let inCorso: Promise<Meteo> | undefined;

// Dopo un errore di MET (429 Ratelimitation, 403 IllegalUserAgent, 5xx…) niente nuovi tentativi
// per 60 s: ritentare a ogni visita peggiorerebbe proprio quei casi.
let erroreFinoA = 0;

async function meteo() {
  if (ultimo && Date.now() < ultimo.scade) return ultimo;
  if (Date.now() < erroreFinoA) throw new Error('MET: in pausa dopo un errore');
  inCorso ??= leggiMet(ultimo)
    .catch((err) => {
      erroreFinoA = Date.now() + 60_000;
      throw err;
    })
    .finally(() => (inCorso = undefined));
  ultimo = await inCorso;
  return ultimo;
}

export async function GET() {
  try {
    const { dati, scade } = await meteo();
    const secondi = Math.floor((scade - Date.now()) / 1000);
    return Response.json(dati, {
      headers: {
        'Content-Type': JSON_UTF8,
        // Solo per la CDN di Vercel: il catch-all di vercel.json mette Cache-Control max-age=0
        // su ogni percorso, e questo header ha la precedenza per la CDN (doc Vercel, caching).
        'Vercel-CDN-Cache-Control': `max-age=${secondi}`,
      },
    });
  } catch (err) {
    // Verso il visitatore niente di MET. Nel log solo i messaggi nostri ("MET …"): quello di
    // JSON.parse, per esempio, contiene un pezzo del corpo di MET (ASVS V16.4.1).
    const nostro = err instanceof Error && err.message.startsWith('MET');
    console.error('[meteo]', nostro ? err.message : err instanceof Error ? err.name : 'errore');
    // A Sentry come Upstash e Turnstile: un guasto di MET (o un 403 IllegalUserAgent) si vede
    // subito, senza aspettare il check Checkly.
    await reportThrottled('meteo', new Error(nostro ? err.message : 'MET: errore'));
    // RFC 9110: 504 se MET non ha risposto in tempo, 502 per una risposta non valida.
    const timeout = err instanceof DOMException && err.name === 'TimeoutError';
    return Response.json(
      { error: 'Meteo non disponibile' },
      {
        status: timeout ? 504 : 502,
        headers: { 'Content-Type': JSON_UTF8, 'Cache-Control': 'no-store' },
      }
    );
  }
}

// Solo GET (OWASP REST Security Cheat Sheet: metodi fuori elenco → 405 Method Not Allowed).
export const ALL = () => new Response(null, { status: 405, headers: { Allow: 'GET' } });
