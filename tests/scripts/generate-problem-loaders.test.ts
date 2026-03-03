import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import { describe, expect, it } from 'vitest';

const execFileAsync = promisify(execFile);

describe('generate-problem-loaders.mjs', () => {
  it('runs successfully and keeps generated loader file valid', async () => {
    const cwd = process.cwd();
    const { stdout } = await execFileAsync(
      process.execPath,
      ['scripts/generate-problem-loaders.mjs'],
      {
        cwd,
      }
    );

    expect(stdout).toContain('Generated');

    const generated = await readFile(
      path.join(cwd, 'src/lib/problems/problem-loaders.generated.ts'),
      'utf8'
    );
    expect(generated).toContain('export const CATEGORY_PROBLEM_EXPORTS');
    expect(generated).toContain('export function loadProblemConfig');
  }, 20000);
});
