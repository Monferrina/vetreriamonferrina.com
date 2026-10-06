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

  test('nessuna violazione CSP su /, /contatti, /servizi e navigando tra pagine', async ({
    page,
  }) => {
    const violazioni: string[] = [];
    page.on('console', (m) => {
      if (/Content Security Policy|Refused to (execute|load|apply)/.test(m.text())) {
        violazioni.push(m.text());
      }
    });
    for (const path of ['/', '/contatti', '/servizi']) {
      await page.goto(path, { waitUntil: 'networkidle' });
    }
    await page.goto('/');
    await page.locator('a[href="/servizi"]:visible').first().click();
    await page.waitForURL('**/servizi');
    await page.waitForLoadState('networkidle');
    expect(violazioni).toEqual([]);
  });
});
