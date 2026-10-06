import { test, expect } from './fixtures';

// CSP1: il CSP delle pagine lo genera Astro nel build (security.csp + staticHeaders), con gli
// hash degli script inline al posto di 'unsafe-inline' (rilievo HawkScan 10055-5). In dev Astro
// non lo emette (doc: "isn't supported while working in dev mode"), quindi lo spec gira solo
// contro un build: in CI la preview Vercel (BASE_URL), in locale un server sul build.
test.describe('CSP senza unsafe-inline', () => {
  test.skip(!process.env.BASE_URL, 'Il CSP esiste solo nel build, non nel dev server');

  test("l'header di / ha script-src con hash e senza 'unsafe-inline'", async ({ page }) => {
    const res = await page.goto('/');
    const csp = res!.headers()['content-security-policy'] ?? '';
    // Più header CSP arrivano fusi con la virgola: si guardano tutte le script-src, perché il
    // browser le applica tutte e basta una con 'unsafe-inline' a tenere in piedi il rilievo.
    const scriptSrc = csp.split(/[;,]/).filter((d) => d.trim().startsWith('script-src'));
    expect(scriptSrc.length).toBeGreaterThan(0);
    expect(scriptSrc.join(' ')).toContain("'sha256-");
    for (const d of scriptSrc) expect(d).not.toContain("'unsafe-inline'");
  });

  // HawkScan 10055-4 "CSP: style-src unsafe-inline" (Medium, 15 percorsi, scan b0d5de5b):
  // gli style="" inline sono diventati classi, e Astro hasha i blocchi <style>.
  test("l'header di / ha style-src senza 'unsafe-inline'", async ({ page }) => {
    const res = await page.goto('/');
    const csp = res!.headers()['content-security-policy'] ?? '';
    const styleSrc = csp.split(/[;,]/).filter((d) => d.trim().startsWith('style-src'));
    expect(styleSrc.length).toBeGreaterThan(0);
    for (const d of styleSrc) expect(d).not.toContain("'unsafe-inline'");
  });

  // Un URL inesistente finiva sul 404.html statico, servito dal fallback dell'adapter senza
  // header (HawkScan 10038 su GET /api, scan b0d5de5b): la 404 è on demand, così l'header
  // con gli hash lo mette Astro come per ogni pagina renderizzata.
  test('un URL inesistente risponde 404 con lo stesso CSP hashato delle pagine', async ({
    page,
  }) => {
    const res = await page.goto('/pagina-che-non-esiste');
    expect(res!.status()).toBe(404);
    const csp = res!.headers()['content-security-policy'] ?? '';
    expect(csp).toContain("script-src 'self' 'sha256-");
    expect(csp).not.toContain("script-src 'self' 'unsafe-inline'");
  });

  // Cloudflare inietta nell'HTML lo script inline "JavaScript Detections" del Bot Fight Mode
  // (su Free acceso e non disattivabile, hash non supportati), che il CSP blocca: misurato in
  // produzione su / e sulla 404. La doc Cloudflare: con `Cache-Control: no-transform`
  // dall'origine non lo inietta. Gli asset tengono la loro cache immutabile.
  test("l'HTML ha Cache-Control no-transform, gli asset restano immutabili", async ({ page }) => {
    const html = await page.goto('/');
    expect(html!.headers()['cache-control']).toContain('no-transform');
    const css = await page.evaluate(
      () =>
        document.querySelector<HTMLLinkElement>('link[rel="stylesheet"][href^="/_astro/"]')?.href
    );
    expect(css).toBeTruthy();
    const asset = await page.request.get(css!);
    expect(asset.headers()['cache-control']).toBe('public, max-age=31536000, immutable');
  });

  // Il CSP non rompe la build: uno script o uno stile non dichiarato in src/lib/csp.ts (o non
  // hashato da Astro) si vede solo nella console del browser. Questa è la rete: ogni pagina della
  // sitemap, così una pagina nuova entra da sola. Le pagine fuori sitemap (404, /api) stanno sotto.
  test('nessuna violazione CSP su tutte le pagine della sitemap', async ({ page, baseURL }) => {
    // 35 pagine a networkidle: ~1,5 s l'una sulla preview, oltre i 30 s di default.
    test.setTimeout(180_000);
    const sitemap = await (await page.request.get('/sitemap-0.xml')).text();
    const paths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
    expect(paths.length).toBeGreaterThan(20);
    const violazioni: string[] = [];
    page.on('console', (m) => {
      if (/Content Security Policy|Refused to (execute|load|apply)/.test(m.text())) {
        violazioni.push(`${page.url().replace(baseURL!, '')}: ${m.text().slice(0, 160)}`);
      }
    });
    for (const path of paths) {
      await page.goto(path, { waitUntil: 'networkidle' });
    }
    expect(violazioni).toEqual([]);
  });

  test('nessuna violazione CSP su /, /contatti, /servizi, /api/send-quote e navigando', async ({
    page,
  }) => {
    const violazioni: string[] = [];
    page.on('console', (m) => {
      if (/Content Security Policy|Refused to (execute|load|apply)/.test(m.text())) {
        violazioni.push(m.text());
      }
    });
    // /api/send-quote in GET è un 404 che Astro rimanda alla pagina di errore: aveva il CSP del
    // middleware senza script-src (7 violazioni sulla preview asqhr6qwk).
    for (const path of ['/', '/contatti', '/servizi', '/api/send-quote']) {
      await page.goto(path, { waitUntil: 'networkidle' });
    }
    await page.goto('/');
    await page.locator('a[href="/servizi"]:visible').first().click();
    await page.waitForURL('**/servizi');
    await page.waitForLoadState('networkidle');
    expect(violazioni).toEqual([]);
  });
});
