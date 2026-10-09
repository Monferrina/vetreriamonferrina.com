// @vitest-environment node
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import { describe, expect, test } from 'vitest';

// stackhawk.yml è la scansione della produzione: ogni POST a /api/send-quote che arriva
// lì manda una email vera tramite Resend e consuma il rate limit dei clienti.
const config = parse(readFileSync('stackhawk.yml', 'utf-8'));

describe('stackhawk.yml, scansione della produzione', () => {
  test('esclude /api/send-quote', () => {
    const excluded = (config.app.excludePaths ?? []).some((re: string) =>
      new RegExp(re).test('/api/send-quote')
    );
    expect(excluded).toBe(true);
  });
});

// Il bypass della Vercel Authentication (AL1) va in authentication.external: è l'unica
// forma che StackHawk oscura nella configurazione caricata; in un replacer finiva in
// chiaro sulla piattaforma (H1, scan 47b0ee7c). Dal TS1 sta solo nel file della preview,
// usato in locale; in CI si entra con il token OIDC di stackhawk-oidc.yml.
const preview = parse(readFileSync('stackhawk-preview.yml', 'utf-8'));

describe('stackhawk-preview.yml, bypass Vercel', () => {
  test('sta in authentication.external e in nessun replacer', () => {
    const values = preview.app.authentication?.external?.values ?? [];
    expect(values).toContainEqual({
      type: 'TOKEN',
      value: { name: 'x-vercel-protection-bypass', val: '${VERCEL_AUTOMATION_BYPASS_SECRET}' },
    });
    expect(JSON.stringify(preview.hawkAddOn?.replacer ?? {})).not.toContain('bypass');
  });
});
