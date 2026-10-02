import { defineConfig, devices } from '@playwright/test';

// Screenshot della preview Vercel di una PR: perché la preview e non il build
// locale lo spiega visuale.yml.
const origin = process.env.PREVIEW_URL ? new URL(process.env.PREVIEW_URL).origin : '';

export default defineConfig({
  testDir: '.',
  outputDir: '../../visuale-results',
  // Il tempo va quasi tutto in attesa di rete: più pagine insieme.
  fullyParallel: true,
  workers: 4,
  reporter: [['list'], ['html', { open: 'never', outputFolder: '../../visuale-report' }]],
  use: {
    baseURL: process.env.PREVIEW_URL,
    // Banner cookie già visto, come negli E2E: altrimenti copre ogni screenshot.
    storageState: {
      cookies: [],
      origins: [{ origin, localStorage: [{ name: 'cookie_notice_seen', value: 'true' }] }],
    },
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['iPhone 13'] } },
  ],
});
