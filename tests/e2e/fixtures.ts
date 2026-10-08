import { test as base, expect } from '@playwright/test';

// Fuori dal sito non parte niente (Playwright, "Only test what you control"): senza, ogni run
// chiamava davvero Vercel Speed Insights, open-meteo e Google Maps (misurato il 05/10), e un loro
// guasto faceva fallire i nostri test. Bloccare per origine e non per elenco di host vuol dire
// anche che l'header del bypass Vercel (extraHTTPHeaders, va a ogni richiesta) non esce mai dal
// sito. Sulla preview Speed Insights sta sullo stesso dominio, sotto /_vercel/: senza blocco i
// test manderebbero metriche vere.
export const test = base.extend<{ terzi: void }>({
  terzi: [
    async ({ context, baseURL }, use) => {
      const sito = new URL(baseURL!).origin;
      await context.route(
        (url) => url.origin !== sito || url.pathname.startsWith('/_vercel/'),
        (route) => route.abort()
      );
      // Turnstile (Z1): lo script di Cloudflare è fuori dal sito e resterebbe bloccato, con il
      // pulsante di invio spento per sempre (misurato in CI l'08/10/2026: 12 test in timeout).
      // Al suo posto un finto window.turnstile che dà subito il token fittizio della doc: i test
      // restano ermetici e il bypass non esce dal sito. Il widget vero lo prova il check Checkly
      // sulla preview (__checks__/scripts/turnstile-widget.ts). Registrata dopo il blocco: Playwright
      // prova le route dall'ultima registrata, quindi questa vince.
      await context.route('https://challenges.cloudflare.com/turnstile/v0/api.js**', (route) =>
        route.fulfill({
          contentType: 'application/javascript',
          body: `window.turnstile = {
            render(el, opts) { setTimeout(() => opts.callback('XXXX.DUMMY.TOKEN.XXXX'), 0); return 'finto'; },
            reset() {},
            remove() {},
          };`,
        })
      );
      await use();
    },
    { auto: true },
  ],
});

export { expect };
