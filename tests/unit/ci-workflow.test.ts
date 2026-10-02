// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';

interface Step {
  run?: string;
}
interface Job {
  name?: string;
  needs?: string | string[];
  steps?: Step[];
}

const workflow = parse(readFileSync('.github/workflows/ci.yml', 'utf-8')) as {
  jobs: Record<string, Job>;
};
const jobs = Object.entries(workflow.jobs);

function jobNamed(name: string): [string, Job] {
  const found = jobs.find(([, job]) => job.name === name);
  if (!found) throw new Error(`nessun job "${name}" in ci.yml`);
  return found;
}

function runs(job: Job): string[] {
  return (job.steps ?? []).flatMap((step) => (step.run ? [step.run] : []));
}

// Un audit rosso dentro il job dei check obbligatori faceva saltare lint, test,
// build e SonarCloud (PR #339): l'audit vive in un job suo, che resta un gate.
describe('CI — audit di sicurezza in un job separato', () => {
  it('il job "Security audit" controlla le dipendenze del sito', () => {
    const [, audit] = jobNamed('Security audit');
    expect(runs(audit)).toEqual(['npm audit --omit=dev --audit-level=high']);
  });

  it('il job dei check obbligatori non esegue audit', () => {
    const [, quality] = jobNamed('Lint, Type Check & Test');
    expect(runs(quality).filter((run) => run.includes(' audit'))).toEqual([]);
  });

  // Con needs, un audit rosso salta il job dipendente, e un job saltato puo'
  // risultare "Success" sui check obbligatori (doc GitHub, required status checks).
  it("nessun job dipende dall'audit", () => {
    const [auditId] = jobNamed('Security audit');
    const dependents = jobs
      .filter(([, job]) => [job.needs ?? []].flat().includes(auditId))
      .map(([id]) => id);
    expect(dependents).toEqual([]);
  });
});
