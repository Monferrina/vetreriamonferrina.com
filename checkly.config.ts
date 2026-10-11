import { defineConfig } from 'checkly';
import { Frequency } from 'checkly/constructs';

const config = defineConfig({
  projectName: 'Vetreria Monferrina',
  logicalId: 'vetreria-monferrina',
  repoUrl: 'https://github.com/Monferrina/vetreriamonferrina.com',
  checks: {
    // Default volutamente basso (giornaliero) per rientrare nel free tier: ogni check
    // senza `frequency` esplicita è "economico". I percorsi critici la alzano localmente.
    frequency: Frequency.EVERY_24H,
    // Una sola location: dimezza i consumi (Checkly conta i run per-location). Sufficiente
    // per un'attività locale; il monitoraggio multi-region non aggiunge valore reale qui.
    locations: ['eu-central-1'],
    tags: ['production'],
    runtimeId: '2025.04',
    checkMatch: '**/__checks__/**/*.check.ts',
    playwrightConfig: {
      use: {
        baseURL: 'https://vetreriamonferrina.com',
      },
    },
  },
  cli: {
    runLocation: 'eu-central-1',
    reporters: ['list'],
    retries: 0,
  },
});

export default config;
