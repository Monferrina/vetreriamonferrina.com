import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:4321',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['iPhone 13'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
    // Astro 7: in presenza di un AI agent `astro dev` parte in background (--background
    // automatico) e il processo foreground esce subito → Playwright vede "webServer exited
    // early". ASTRO_DEV_BACKGROUND=0 forza il foreground (opt-out ufficiale). In CI, senza
    // agent, resta foreground di suo. ASTRO_DEV_TOOLBAR=0 evita che la toolbar inietti markup.
    env: { ASTRO_DEV_TOOLBAR: '0', ASTRO_DEV_BACKGROUND: '0' },
  },
});
