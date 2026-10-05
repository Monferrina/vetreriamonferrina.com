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
      await use();
    },
    { auto: true },
  ],
});

export { expect };
