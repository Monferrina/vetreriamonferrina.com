// @vitest-environment node
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import { describe, expect, test } from 'vitest';

// agenti.yml dà a un modello un token che scrive sulle PR. Questi test fissano chi può far
// partire la revisione e cosa il modello può fare.
const workflow = parse(readFileSync('.github/workflows/agenti.yml', 'utf-8'));
const job = workflow.jobs.revisione;
const gemini = job.steps.find((step: { id?: string }) => step.id === 'gemini');

describe('agenti.yml, revisione delle PR con Gemini', () => {
  test('il token legge il codice e scrive solo sulle PR', () => {
    expect(workflow.permissions).toEqual({});
    expect(job.permissions).toEqual({ contents: 'read', 'pull-requests': 'write' });
  });

  test('parte su PR aperte e su commenti, mai con pull_request_target', () => {
    expect(workflow.on).toEqual({
      pull_request: { types: ['opened', 'reopened', 'ready_for_review'] },
      issue_comment: { types: ['created'] },
    });
  });

  // Stringa intera, non clausole sparse: una clausola spostata nell'altro ramo dell'OR aprirebbe
  // il cancello senza far fallire un controllo per pezzi.
  test('su una PR esclude fork, Dependabot e bozze; da commento vuole @gemini-cli di un collaboratore', () => {
    expect(job.if).toBe(`(
  github.event_name == 'pull_request' &&
  github.event.pull_request.head.repo.fork == false &&
  github.event.pull_request.user.login != 'dependabot[bot]' &&
  github.event.pull_request.draft == false
) || (
  github.event_name == 'issue_comment' &&
  github.event.issue.pull_request &&
  startsWith(github.event.comment.body, '@gemini-cli') &&
  contains(fromJSON('["OWNER", "MEMBER", "COLLABORATOR"]'), github.event.comment.author_association)
)`);
  });

  // issue_comment non dice se la PR viene da un fork: lo chiede uno step prima di Gemini.
  test('Gemini parte solo se la PR non viene da un fork, anche quando la chiede un commento', () => {
    const pr = job.steps.find((step: { id?: string }) => step.id === 'pr');
    expect(pr.run).toContain('--jq .head.repo.fork');
    expect(gemini.if).toBe("steps.pr.outputs.fork == 'false'");
  });

  // Con tools.core vuoto Gemini CLI nega ogni strumento, MCP compresi; senza --yolo, in headless,
  // passano solo quelli elencati per nome in tools.allowed (gemini-cli 0.62.0, policy/config.ts).
  test('il modello non ha la shell e su GitHub ha solo gli strumenti della revisione, senza --yolo', () => {
    const settings = JSON.parse(gemini.env.SETTINGS);
    expect(settings.tools.core).toEqual([]);
    expect(settings.tools.allowed).toEqual([
      'mcp_github_add_comment_to_pending_review',
      'mcp_github_pull_request_read',
      'mcp_github_pull_request_review_write',
    ]);
    expect(settings.mcpServers.github.includeTools).toEqual([
      'add_comment_to_pending_review',
      'pull_request_read',
      'pull_request_review_write',
    ]);
    expect(gemini.run).not.toContain('--yolo');
  });

  test('Gemini CLI è fissata per versione e per impronta del pacchetto', () => {
    expect(gemini.run).toContain('@google/gemini-cli@0.62.0');
    expect(gemini.run).toContain(
      'A1rw0Tf2sHLpGncfYdaq5WaJIufKAP8il4BmHD5Yw4ewmB/Wo0vRQb2bEvx7OqyaPFPZCh0hVhcMKsICZyIBww=='
    );
  });
});
