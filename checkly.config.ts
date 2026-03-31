import { defineConfig } from 'checkly';

const config = defineConfig({
  projectName: 'Vetreria Monferrina',
  logicalId: 'vetreria-monferrina',
  repoUrl: 'https://github.com/Monferrina/vetreriamonferrina.com',
  checks: {
    frequency: 10,
    locations: ['eu-central-1', 'eu-west-1'],
    tags: ['production'],
    runtimeId: '2025.04',
    checkMatch: '**/__checks__/**/*.check.ts',
    playwrightConfig: {
      use: {
        baseURL: 'https://vetreriamonferrina.com',
      },
    },
    browserChecks: {
      testMatch: '**/__checks__/**/*.spec.ts',
    },
  },
  cli: {
    runLocation: 'eu-central-1',
    reporters: ['list'],
    retries: 0,
  },
});

export default config;
