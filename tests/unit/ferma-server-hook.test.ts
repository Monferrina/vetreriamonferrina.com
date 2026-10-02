// @vitest-environment node
import { describe, it, expect, afterEach } from 'vitest';
import { spawn, execFileSync, type ChildProcess } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const hook = resolve('.claude/hooks/ferma-server.sh');
const avviati: ChildProcess[] = [];
const cartelle: string[] = [];

function cartella(): string {
  const dir = mkdtempSync(join(tmpdir(), 'ferma-server-'));
  cartelle.push(dir);
  return dir;
}

function inAscolto(pid: number): boolean {
  return execFileSync('ss', ['-ltnpH'], { encoding: 'utf-8' }).includes(`pid=${pid},`);
}

async function server(cwd: string): Promise<ChildProcess> {
  const child = spawn('python3', ['-m', 'http.server', '0', '--bind', '127.0.0.1'], {
    cwd,
    stdio: 'ignore',
  });
  avviati.push(child);
  for (let i = 0; i < 50 && !inAscolto(child.pid!); i++)
    await new Promise((r) => setTimeout(r, 100));
  return child;
}

function terminato(child: ChildProcess): Promise<boolean> {
  if (child.exitCode !== null || child.signalCode !== null) return Promise.resolve(true);
  return new Promise((r) => {
    const t = setTimeout(() => r(false), 3000);
    child.once('exit', () => (clearTimeout(t), r(true)));
  });
}

afterEach(() => {
  for (const child of avviati.splice(0)) child.kill();
  for (const dir of cartelle.splice(0)) rmSync(dir, { recursive: true, force: true });
});

describe('hook SessionEnd ferma-server', () => {
  it('ferma il server del progetto e lascia quello di un altro', async () => {
    const progetto = cartella();
    const altro = cartella();
    const dentro = await server(progetto);
    const fuori = await server(altro);

    execFileSync('bash', [hook], {
      env: { ...process.env, CLAUDE_PROJECT_DIR: progetto },
    });

    expect(await terminato(dentro)).toBe(true);
    expect(inAscolto(fuori.pid!)).toBe(true);
  });
});
