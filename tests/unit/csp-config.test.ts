// @vitest-environment node
import { describe, expect, test } from 'vitest';
import config from '../../astro.config.mjs';
import { cspDirectives } from '../../src/lib/csp';

// Con security.csp spento il sito resta senza CSP e nessun test se ne accorge: le pagine
// statiche lo prendono solo da qui (vercel.json non lo porta più). L'header al posto del
// <meta> (staticHeaders dell'adapter) lo prova tests/e2e/csp.spec.ts sulla preview.
describe('astro.config.mjs, security.csp', () => {
  const csp = config.security?.csp;

  test('è attivo con le direttive condivise con il middleware', () => {
    expect(csp).toBeTypeOf('object');
    expect((csp as { directives?: string[] }).directives).toBe(cspDirectives);
  });

  test("script-src e style-src senza 'unsafe-inline' (HawkScan 10055-4 e 10055-5)", () => {
    const { scriptDirective, styleDirective } = csp as {
      scriptDirective?: { resources?: unknown[] };
      styleDirective?: { resources?: unknown[] };
    };
    expect(JSON.stringify(scriptDirective?.resources ?? [])).not.toContain('unsafe-inline');
    expect(JSON.stringify(styleDirective?.resources ?? [])).not.toContain('unsafe-inline');
  });
});
