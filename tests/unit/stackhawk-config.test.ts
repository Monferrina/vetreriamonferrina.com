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
