import { test as base, expect } from '@playwright/test';

// Fuori dal sito non parte niente (Playwright, "Only test what you control"): senza, ogni run
// chiamava davvero Google Maps (misurato il 05/10), e un suo guasto faceva fallire i nostri
// test. Bloccare per origine e non per elenco di host vuol dire anche che il token per la
// preview (extraHTTPHeaders, va a ogni richiesta) non esce mai dal sito.
export const test = base.extend<{ terzi: void }>({
  // La preview è protetta (Vercel Authentication): in e2e.yml passa con un token OIDC di GitHub
  // accettato da Trusted Sources (TS1). Il token dura 300 s (misurato il 09/10/2026, run
  // 37903142803) e la suite 1.8 minuti: uno per test, così un run lento o con retry non finisce
  // sulla pagina di login. Fuori da e2e.yml la variabile non c'è.
  extraHTTPHeaders: async ({ extraHTTPHeaders }, use) => {
    const url = process.env.ACTIONS_ID_TOKEN_REQUEST_URL;
    if (!url) return use(extraHTTPHeaders);
    const res = await fetch(url, {
      headers: { authorization: `bearer ${process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN}` },
    });
    if (!res.ok) throw new Error(`Token OIDC di GitHub: HTTP ${res.status}`);
    const { value } = (await res.json()) as { value: string };
    await use({ ...extraHTTPHeaders, 'x-vercel-trusted-oidc-idp-token': value });
  },
  terzi: [
    async ({ context, baseURL }, use) => {
      const sito = new URL(baseURL!).origin;
      await context.route(
        (url) => url.origin !== sito,
        (route) => route.abort()
      );
      await use();
    },
    { auto: true },
  ],
});

export { expect };
