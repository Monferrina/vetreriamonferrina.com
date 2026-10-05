import { test as base, expect } from '@playwright/test';

// Terzi bloccati in ogni test (Playwright, "Only test what you control"): senza, ogni run
// chiamava davvero Vercel Speed Insights, open-meteo e Google Maps, e un loro guasto
// faceva fallire i nostri test. Misurato il 05/10: sono le uniche richieste fuori dal sito.
const TERZI = /^https:\/\/(va\.vercel-scripts\.com|api\.open-meteo\.com|www\.google\.com\/maps)\//;

export const test = base.extend<{ terzi: void }>({
  terzi: [
    async ({ context }, use) => {
      await context.route(TERZI, (route) => route.abort());
      await use();
    },
    { auto: true },
  ],
});

export { expect };
