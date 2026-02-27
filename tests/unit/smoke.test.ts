import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

describe('Smoke test', () => {
  it('il progetto ha le variabili di tema', () => {
    const css = readFileSync('src/styles/global.css', 'utf-8');
    expect(css).toContain('--color-primary');
    expect(css).toContain('--font-heading');
  });
});
