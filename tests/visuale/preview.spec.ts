import { test, expect } from '@playwright/test';

const preview = process.env.PREVIEW_URL ?? '';
const bypass = { 'x-vercel-protection-bypass': process.env.VERCEL_AUTOMATION_BYPASS_SECRET ?? '' };

// Le pagine vengono dalla sitemap della preview (@astrojs/sitemap): una pagina
// nuova entra da sola. Le <loc> puntano al dominio di produzione, serve il percorso.
async function pagine(): Promise<string[]> {
  if (!preview) return [];
  const xml = await (await fetch(new URL('/sitemap-0.xml', preview), { headers: bypass })).text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, loc]) => new URL(loc).pathname);
}

test.beforeEach(async ({ context, baseURL }) => {
  // Una richiesta con l'header imposta il cookie di bypass (doc Vercel, Protection
  // Bypass for Automation): le pagine poi passano senza header, che con
  // extraHTTPHeaders andrebbe anche a Google Maps, Sentry e agli altri terzi.
  await context.request.get(baseURL ?? '', {
    headers: { ...bypass, 'x-vercel-set-bypass-cookie': 'true' },
  });
});

for (const path of await pagine()) {
  test(`${path}: risorse sotto 400, nessun blocco CSP`, async ({ page }, testInfo) => {
    const risorseKo: string[] = [];
    page.on('response', (r) => {
      if (r.status() >= 400) risorseKo.push(`${r.status()} ${r.url()}`);
    });
    // Solo le violazioni applicate: quelle "report" non bloccano niente (per
    // esempio la policy di sola segnalazione che Cloudflare aggiunge in produzione).
    const bloccatiCsp: string[] = [];
    await page.exposeFunction('violazioneCsp', (v: string) => bloccatiCsp.push(v));
    await page.addInitScript(() => {
      document.addEventListener('securitypolicyviolation', (e) => {
        if (e.disposition === 'enforce') {
          (window as unknown as { violazioneCsp: (v: string) => void }).violazioneCsp(
            `${e.effectiveDirective} ${e.blockedURI}`
          );
        }
      });
    });

    await page.goto(path, { waitUntil: 'networkidle' });
    await testInfo.attach('screenshot', {
      body: await page.screenshot({ fullPage: true }),
      contentType: 'image/png',
    });

    expect(risorseKo).toEqual([]);
    expect(bloccatiCsp).toEqual([]);
  });
}
