// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { parse } from 'yaml';

interface Job {
  name?: string;
}
interface Workflow {
  permissions?: unknown;
  jobs: Record<string, Job>;
}

const dir = '.github/workflows';
const workflows: [string, Workflow][] = readdirSync(dir)
  .filter((file) => file.endsWith('.yml'))
  .map((file) => [file, parse(readFileSync(`${dir}/${file}`, 'utf-8')) as Workflow]);

// I check obbligatori di protect-main che sono job nostri: il ruleset
// lega il nome, non il file. Un job rinominato o duplicato lascia il ruleset in
// attesa di un check che non arriva, o lo fa passare con il job sbagliato.
const REQUIRED = ['Lint, Type Check & Test', 'E2E (Playwright)', 'Semgrep (regole della repo)'];

function jobsNamed(name: string): string[] {
  return workflows.flatMap(([file, workflow]) =>
    Object.entries(workflow.jobs)
      .filter(([, job]) => job.name === name)
      .map(([id]) => `${file}:${id}`)
  );
}

describe('CI — check obbligatori', () => {
  it.each(REQUIRED)('il job "%s" esiste una volta sola', (name) => {
    expect(jobsNamed(name)).toHaveLength(1);
  });
});

// Un permesso di scrittura sul workflow vale per ogni job, anche per quelli che
// non scrivono (Scorecard Token-Permissions, rilievo Aikido "Overly Broad
// Permissions"): la scrittura si concede sul job che la usa. Senza blocco
// permissions il token prende i permessi predefiniti dell'organizzazione.
describe('CI — permessi', () => {
  it.each(workflows)('%s non concede scrittura a livello di workflow', (_file, workflow) => {
    expect(workflow.permissions).toBeDefined();
    expect(JSON.stringify(workflow.permissions)).not.toMatch(/write/);
  });
});
