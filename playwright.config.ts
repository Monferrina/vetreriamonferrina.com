import { defineConfig, devices } from '@playwright/test';

// In CI gli E2E girano sulla preview Vercel della PR (BASE_URL dal workflow e2e.yml), cioè sul
// build di produzione; in locale sul dev server. La preview è protetta: il secret "Protection
// Bypass for Automation" passa come header, senza il quale arriva la pagina di login Vercel;
// x-vercel-skip-toolbar toglie la toolbar che Vercel inietta nelle preview (misurato il 05/10:
// lo script vercel.live sparisce dall'HTML), così il DOM sotto test è quello di produzione.
const remoto = process.env.BASE_URL;
const baseURL = remoto ?? 'http://localhost:4321';
const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // Worker di default (metà dei core) anche in CI: la doc consiglia 1 perché server e browser
  // si contendono il runner, ma qui il server è la preview Vercel.
  // In CI il reporter github annota i fallimenti e stampa nel log il riepilogo (misurato il
  // 05/10: "2 passed" + notice "Playwright Run Summary"; i flaky li conta secondo il suo
  // sorgente, non ancora visto su un caso vero). L'html resta come artefatto.
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }]]
    : [['html', { open: 'never' }]],
  use: {
    baseURL,
    extraHTTPHeaders: bypass
      ? { 'x-vercel-protection-bypass': bypass, 'x-vercel-skip-toolbar': '1' }
      : undefined,
    // La traccia del tentativo che fallisce, non del retry: sulla preview due fallimenti rari
    // (05/10, pagina senza CSS) erano passati al retry e la traccia non diceva niente.
    // In CI no: la traccia registra gli header delle richieste, bypass compreso, e
    // e2e.yml la pubblica come artefatto di una repo pubblica (Z1, PT-2).
    trace: process.env.CI ? 'off' : 'retain-on-first-failure',
    screenshot: 'only-on-failure',
    // Banner cookie gia visto: evita che intercetti i click (chatbot/bottom nav
    // su mobile). legal.spec fa opt-out per testare il banner stesso.
    storageState: {
      cookies: [],
      origins: [
        {
          origin: new URL(baseURL).origin,
          localStorage: [{ name: 'cookie_notice_seen', value: 'true' }],
        },
      ],
    },
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['iPhone 13'] } },
  ],
  webServer: remoto
    ? undefined
    : {
        command: 'npm run dev',
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 30_000,
        // Astro 7: in presenza di un AI agent `astro dev` parte in background (--background
        // automatico) e il processo foreground esce subito → Playwright vede "webServer exited
        // early". ASTRO_DEV_BACKGROUND=0 forza il foreground (opt-out ufficiale). In CI, senza
        // agent, resta foreground di suo. ASTRO_DEV_TOOLBAR=0 evita che la toolbar inietti markup.
        env: { ASTRO_DEV_TOOLBAR: '0', ASTRO_DEV_BACKGROUND: '0' },
      },
});
