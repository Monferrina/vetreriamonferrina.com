// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
import { email } from '../../src/data/contatti';

// Risposta di MET Norway (locationforecast 2.0 compact) per Casale Monferrato, ridotta al primo
// istante: valori veri del 10/10/2026 13:00 UTC. Expires e Last-Modified come li manda MET.
const metBody = (symbol = 'clearsky_day') => ({
  properties: {
    timeseries: [
      {
        time: '2026-10-10T13:00:00Z',
        data: {
          instant: {
            details: { air_temperature: 20.0, relative_humidity: 72.8, wind_speed: 1.2 },
          },
          next_1_hours: { summary: { symbol_code: symbol } },
        },
      },
    ],
  },
});

const metResponse = (body: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json', Expires: 'Sat, 10 Oct 2026 14:23:57 GMT' },
    ...init,
  });

// L'endpoint tiene in memoria l'ultima risposta di MET: un modulo nuovo per ogni test.
async function caricaMeteo(fetchMock: ReturnType<typeof vi.fn>) {
  vi.resetModules();
  vi.stubGlobal('fetch', fetchMock);
  return (await import('../../src/pages/api/meteo')).GET;
}
const chiamaMeteo = async (fetchMock: ReturnType<typeof vi.fn>) => (await caricaMeteo(fetchMock))();

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('GET /api/meteo', () => {
  it('riduce la previsione MET ai campi del widget', async () => {
    const res = await chiamaMeteo(vi.fn().mockResolvedValue(metResponse(metBody())));
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('application/json; charset=utf-8');
    expect(await res.json()).toEqual({
      temperatura: 20,
      umidita: 73,
      vento: 4,
      icona: '☀️',
      descrizione: 'Sereno',
      pioggia: false,
      temporale: false,
    });
  });

  // Termini MET: User-Agent con dominio e contatto dell'azienda, coordinate a massimo 4
  // decimali (con 5 o più MET risponde 403).
  it("si presenta a MET come chiedono i termini d'uso", async () => {
    const fetchMock = vi.fn().mockResolvedValue(metResponse(metBody()));
    await chiamaMeteo(fetchMock);
    const [url, init] = fetchMock.mock.calls[0];
    const params = new URL(url).searchParams;
    for (const p of ['lat', 'lon']) expect(params.get(p)).toMatch(/^\d+(\.\d{1,4})?$/);
    const ua = new Headers(init?.headers).get('User-Agent');
    expect(ua).toContain('vetreriamonferrina.com');
    expect(ua).toContain(email);
  });

  // Termini MET: "Cache data locally and use the If-Modified-Since request header". Scaduta la
  // cache, si richiede con la data dell'ultima risposta; con 304 si tengono i dati che ci sono.
  it('scaduta la cache richiede con If-Modified-Since e con 304 tiene i dati', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-10T13:53:57Z'));
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        metResponse(metBody(), {
          headers: {
            'Content-Type': 'application/json',
            Expires: 'Sat, 10 Oct 2026 14:23:57 GMT',
            'Last-Modified': 'Sat, 10 Oct 2026 13:52:00 GMT',
          },
        })
      )
      .mockResolvedValueOnce(
        new Response(null, { status: 304, headers: { Expires: 'Sat, 10 Oct 2026 14:54:00 GMT' } })
      );
    const GET = await caricaMeteo(fetchMock);
    await GET();
    vi.setSystemTime(new Date('2026-10-10T14:24:00Z'));
    const res = await GET();
    const richiesta = new Headers(fetchMock.mock.calls[1][1]?.headers);
    expect(richiesta.get('If-Modified-Since')).toBe('Sat, 10 Oct 2026 13:52:00 GMT');
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ temperatura: 20, descrizione: 'Sereno' });
    expect(res.headers.get('Vercel-CDN-Cache-Control')).toBe('max-age=1800');
  });

  // La CDN di Vercel tiene la risposta finché MET la dichiara valida (termini: non ripetere la
  // richiesta prima di Expires).
  it("fa tenere la risposta in cache fino all'Expires di MET", async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-10T13:53:57Z'));
    const res = await chiamaMeteo(vi.fn().mockResolvedValue(metResponse(metBody())));
    expect(res.headers.get('Vercel-CDN-Cache-Control')).toBe('max-age=1800');
  });

  // Expires arriva da fuori: un valore assurdo (anni avanti) non deve fissare un meteo per
  // sempre in memoria e nella CDN. Tetto di un'ora.
  it("Expires lontano: la cache dura al massimo un'ora", async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-10T13:00:00Z'));
    const res = await chiamaMeteo(
      vi.fn().mockResolvedValue(
        metResponse(metBody(), {
          headers: { 'Content-Type': 'application/json', Expires: 'Tue, 01 Jan 2030 00:00:00 GMT' },
        })
      )
    );
    expect(res.headers.get('Vercel-CDN-Cache-Control')).toBe('max-age=3600');
  });

  it('MET in errore: 502, senza niente della risposta di MET', async () => {
    for (const fetchMock of [
      vi.fn().mockResolvedValue(new Response('dettaglio interno di MET', { status: 503 })),
      vi.fn().mockRejectedValue(new TypeError('fetch failed')),
    ]) {
      const res = await chiamaMeteo(fetchMock);
      expect(res.status).toBe(502);
      expect(await res.text()).not.toMatch(/dettaglio interno|fetch failed/);
    }
  });

  // Legenda ufficiale dei simboli MET (github.com/metno/weathericons, weather/legend.csv, letta
  // il 10/10/2026): 41 simboli, quelli con varianti hanno _day, _night e _polartwilight. Gli id
  // sono copiati come sono, refusi compresi (lightssleet…, lightssnow…).
  const conVarianti = `clearsky fair partlycloudy lightrainshowers rainshowers heavyrainshowers
    lightrainshowersandthunder rainshowersandthunder heavyrainshowersandthunder lightsleetshowers
    sleetshowers heavysleetshowers lightssleetshowersandthunder sleetshowersandthunder
    heavysleetshowersandthunder lightsnowshowers snowshowers heavysnowshowers
    lightssnowshowersandthunder snowshowersandthunder heavysnowshowersandthunder`.split(/\s+/);
  const senzaVarianti = `cloudy lightrain rain heavyrain lightrainandthunder rainandthunder
    heavyrainandthunder lightsleet sleet heavysleet lightsleetandthunder sleetandthunder
    heavysleetandthunder lightsnow snow heavysnow lightsnowandthunder snowandthunder
    heavysnowandthunder fog`.split(/\s+/);
  const simboli = [
    ...conVarianti.flatMap((s) => ['day', 'night', 'polartwilight'].map((v) => `${s}_${v}`)),
    ...senzaVarianti,
  ];

  it('ogni simbolo della legenda MET ha icona e descrizione', async () => {
    expect(conVarianti.length + senzaVarianti.length).toBe(41);
    for (const simbolo of simboli) {
      const dati = await (
        await chiamaMeteo(vi.fn().mockResolvedValue(metResponse(metBody(simbolo))))
      ).json();
      expect(dati.icona, simbolo).toMatch(/\S/);
      expect(dati.descrizione, simbolo).toMatch(/^[A-Z]/);
    }
  });

  it.each([
    ['rain', 'Pioggia', true, false],
    ['lightsnowshowers_day', 'Rovesci di neve deboli', true, false],
    ['heavyrainshowersandthunder_night', 'Rovesci forti con temporale', true, true],
    ['fog', 'Nebbia', false, false],
    ['partlycloudy_night', 'Parzialmente nuvoloso', false, false],
  ])('%s → %s, pioggia %s, temporale %s', async (simbolo, descrizione, pioggia, temporale) => {
    const dati = await (
      await chiamaMeteo(vi.fn().mockResolvedValue(metResponse(metBody(simbolo))))
    ).json();
    expect(dati).toMatchObject({ descrizione, pioggia, temporale });
  });

  // OWASP API10:2023: i dati di un'API di terzi si validano prima di usarli. Qualunque forma
  // inattesa diventa 502, e niente del contenuto di MET arriva alla pagina.
  const conDettagli = (details: Record<string, unknown>) => ({
    properties: {
      timeseries: [
        {
          data: {
            instant: { details },
            next_1_hours: { summary: { symbol_code: 'clearsky_day' } },
          },
        },
      ],
    },
  });
  const valido = { air_temperature: 20, relative_humidity: 72.8, wind_speed: 1.2 };
  it.each([
    ['temperatura come stringa', conDettagli({ ...valido, air_temperature: '<b>20</b>' })],
    ['temperatura fuori scala', conDettagli({ ...valido, air_temperature: 999 })],
    ['umidità oltre 100', conDettagli({ ...valido, relative_humidity: 150 })],
    ['vento negativo', conDettagli({ ...valido, wind_speed: -1 })],
    ['campo mancante', conDettagli({ air_temperature: 20, relative_humidity: 72.8 })],
    ['simbolo fuori legenda', metBody('<img src=x onerror=alert(1)>')],
    ['simbolo del prototipo', metBody('constructor')],
    ['serie vuota', { properties: { timeseries: [] } }],
    ['non un oggetto', ['MET']],
    ['risposta oltre 1 MB', { ...metBody(), riempitivo: 'x'.repeat(1_100_000) }],
  ])('MET malformato (%s): 502', async (_caso, body) => {
    const res = await chiamaMeteo(vi.fn().mockResolvedValue(metResponse(body)));
    expect(res.status).toBe(502);
    expect(await res.text()).not.toMatch(/<|999|150|MET/);
  });

  // OWASP API4:2023: chi chiama /api/meteo non deve poter moltiplicare le richieste verso MET
  // (cache della CDN aggirabile con ?x=1, ?x=2…): una chiamata sola finché la risposta vale,
  // condivisa anche dalle richieste contemporanee.
  it('richieste contemporanee e ripetute prima di Expires: una sola chiamata a MET', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-10T13:53:57Z'));
    const fetchMock = vi.fn().mockResolvedValue(metResponse(metBody()));
    const GET = await caricaMeteo(fetchMock);
    const risposte = await Promise.all(Array.from({ length: 50 }, () => GET()));
    vi.setSystemTime(new Date('2026-10-10T14:20:00Z'));
    risposte.push(await GET());
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(risposte.every((r) => r.status === 200)).toBe(true);
  });

  it('senza Expires la risposta vale comunque 60 secondi', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-10T13:00:00Z'));
    const fetchMock = vi
      .fn()
      .mockImplementation(async () => new Response(JSON.stringify(metBody()), { status: 200 }));
    const GET = await caricaMeteo(fetchMock);
    const prima = await GET();
    expect(prima.headers.get('Vercel-CDN-Cache-Control')).toBe('max-age=60');
    vi.setSystemTime(new Date('2026-10-10T13:00:59Z'));
    await GET();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    vi.setSystemTime(new Date('2026-10-10T13:01:01Z'));
    await GET();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('MET in errore: per 60 secondi non si richiama, si risponde 502', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-10T13:00:00Z'));
    const fetchMock = vi.fn().mockResolvedValue(new Response('', { status: 503 }));
    const GET = await caricaMeteo(fetchMock);
    expect((await GET()).status).toBe(502);
    vi.setSystemTime(new Date('2026-10-10T13:00:59Z'));
    expect((await GET()).status).toBe(502);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    vi.setSystemTime(new Date('2026-10-10T13:01:01Z'));
    await GET();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  // RFC 9110 §15.6.5: il gateway che non riceve risposta in tempo dal server a monte risponde
  // 504. La richiesta a MET deve avere un limite di tempo (OWASP API10:2023, ASVS V13.1.3).
  it('MET che non risponde in tempo: 504, e la richiesta aveva un limite di tempo', async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValue(
        new DOMException('The operation was aborted due to timeout', 'TimeoutError')
      );
    const res = await chiamaMeteo(fetchMock);
    expect(fetchMock.mock.calls[0][1]?.signal).toBeInstanceOf(AbortSignal);
    expect(res.status).toBe(504);
    expect(await res.text()).not.toMatch(/timeout|aborted/i);
  });
});
