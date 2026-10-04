// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { parse } from 'yaml';

interface Step {
  run?: string;
}
interface Job {
  name?: string;
  needs?: string | string[];
  steps?: Step[];
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
const REQUIRED = [
  'Security audit',
  'Lint, Type Check & Test',
  'E2E (Playwright)',
  'Semgrep (regole della repo)',
];

function jobsNamed(name: string): { file: string; workflow: Workflow; id: string; job: Job }[] {
  return workflows.flatMap(([file, workflow]) =>
    Object.entries(workflow.jobs)
      .filter(([, job]) => job.name === name)
      .map(([id, job]) => ({ file, workflow, id, job }))
  );
}

function jobNamed(name: string) {
  const [found] = jobsNamed(name);
  if (!found) throw new Error(`nessun job "${name}" nei workflow`);
  return found;
}

function runs(job: Job): string[] {
  return (job.steps ?? []).flatMap((step) => (step.run ? [step.run] : []));
}

describe('CI — check obbligatori', () => {
  it.each(REQUIRED)('il job "%s" esiste una volta sola', (name) => {
    expect(jobsNamed(name).map(({ file, id }) => `${file}:${id}`)).toHaveLength(1);
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

// Un audit rosso dentro il job dei check obbligatori faceva saltare lint, test,
// build e SonarCloud (PR #339): l'audit vive in un job suo, che resta un gate.
describe('CI — audit di sicurezza in un job separato', () => {
  it('il job "Security audit" controlla le dipendenze del sito', () => {
    const { job } = jobNamed('Security audit');
    expect(runs(job)).toEqual(['npm audit --omit=dev --audit-level=high']);
  });

  it('il job dei check obbligatori non esegue audit', () => {
    const { job } = jobNamed('Lint, Type Check & Test');
    expect(runs(job).filter((run) => run.includes(' audit'))).toEqual([]);
  });

  // Con needs, un audit rosso salta il job dipendente, e un job saltato puo'
  // risultare "Success" sui check obbligatori (doc GitHub, required status checks).
  it("nessun job dipende dall'audit", () => {
    const { workflow, id: auditId } = jobNamed('Security audit');
    const dependents = Object.entries(workflow.jobs)
      .filter(([, job]) => [job.needs ?? []].flat().includes(auditId))
      .map(([id]) => id);
    expect(dependents).toEqual([]);
  });
});
