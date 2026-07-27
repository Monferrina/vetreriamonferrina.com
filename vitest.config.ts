/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'happy-dom',
    coverage: {
      provider: 'v8',
      reporter: ['lcov', 'text'],
      reportsDirectory: './coverage',
      include: ['src/**'],
      // Escluso ciò che non è codice eseguibile: dati statici e fogli di stile
      // gonfiavano il denominatore senza che ci fosse nulla da coprire.
      exclude: ['src/env.d.ts', 'src/data/**', 'src/styles/**'],
      // Soglie per cartella, non globali. La percentuale complessiva è bassa per
      // costruzione — le pagine .astro le esercita Playwright, non i unit test — e
      // una soglia globale su quel numero sarebbe rumore che si impara a ignorare.
      // Qui si gatta dove vive la logica, appena sotto i valori raggiunti, così una
      // regressione fa rosso ma un refactor onesto no.
      thresholds: {
        'src/lib/**': { statements: 98, branches: 95, functions: 100, lines: 98 },
        'src/pages/api/**': { statements: 100, branches: 90, functions: 100, lines: 100 },
      },
    },
  },
});
