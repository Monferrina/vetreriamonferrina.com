import { describe, expect, test } from 'vitest';
import { sentryOptions } from '../../src/lib/sentry-options';

// Il form preventivi senza JS fa un GET: nome, email e telefono finiscono nella query
// string, e l'URL della pagina viaggia nell'evento Sentry anche con urlQueryParams spento.
describe('sentryOptions.beforeSend', () => {
  test("toglie query string e frammento dall'URL della richiesta", () => {
    const event = {
      request: {
        url: 'https://vetreriamonferrina.com/preventivo?nome=Mario+Rossi&email=mario%40example.com#modulo',
      },
    };

    const sent = sentryOptions.beforeSend(event);

    expect(sent.request.url).toBe('https://vetreriamonferrina.com/preventivo');
  });

  // Gli script inline della pagina hanno come filename l'URL del documento, query compresa:
  // misurato sulla build di produzione, il frame portava nome, email e telefono.
  test('toglie query string e frammento dai frame dello stack trace', () => {
    const pageUrl = 'https://vetreriamonferrina.com/preventivo?name=Mario+Rossi&phone=3331234567#x';
    const event = {
      exception: {
        values: [{ stacktrace: { frames: [{ filename: pageUrl, abs_path: pageUrl }] } }],
      },
    };

    const sent = sentryOptions.beforeSend(event);

    expect(sent.exception.values[0].stacktrace.frames[0]).toEqual({
      filename: 'https://vetreriamonferrina.com/preventivo',
      abs_path: 'https://vetreriamonferrina.com/preventivo',
    });
  });

  // Il testo di un errore può citare location.href (es. SecurityError della History API).
  test("toglie query string e frammento dagli URL nel testo dell'errore e nel messaggio", () => {
    const pageUrl = 'https://vetreriamonferrina.com/preventivo?email=mario%40example.com#x';
    const event = {
      message: `Navigazione fallita verso ${pageUrl}`,
      exception: {
        values: [{ value: `Failed to execute 'pushState' on 'History': ${pageUrl} denied` }],
      },
    };

    const sent = sentryOptions.beforeSend(event);

    expect(sent.message).toBe(
      'Navigazione fallita verso https://vetreriamonferrina.com/preventivo'
    );
    expect(sent.exception.values[0].value).toBe(
      "Failed to execute 'pushState' on 'History': https://vetreriamonferrina.com/preventivo denied"
    );
  });
  // Misurato sulla build di produzione (A3): Promise.reject di un oggetto finisce in
  // extra.__serialized__, e un URL relativo nel testo dell'errore non ha lo schema.
  test('toglie query string e frammento anche dagli URL relativi e dai campi extra', () => {
    const event = {
      message: 'Failed to load /preventivo?email=mario%40example.com',
      extra: { __serialized__: { url: '/preventivo?phone=3331234567#x', nota: 'resta' } },
    };

    const sent = sentryOptions.beforeSend(event);

    expect(sent).toEqual({
      message: 'Failed to load /preventivo',
      extra: { __serialized__: { url: '/preventivo', nota: 'resta' } },
    });
  });
});

// Breadcrumbs porterebbe nell'evento gli URL delle navigazioni con la query del form senza JS,
// Console i messaggi della console; BrowserSession manderebbe una richiesta a ogni pagina vista.
describe('sentryOptions.integrations', () => {
  test('toglie Breadcrumbs, Console e BrowserSession, tiene le altre', () => {
    const defaults = ['InboundFilters', 'Breadcrumbs', 'Console', 'BrowserSession', 'Dedupe'].map(
      (name) => ({ name })
    );

    const kept = sentryOptions.integrations(defaults).map((i) => i.name);

    expect(kept).toEqual(['InboundFilters', 'Dedupe']);
  });
});
