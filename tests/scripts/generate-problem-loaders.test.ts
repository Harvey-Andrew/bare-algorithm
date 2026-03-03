import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import { describe, expect, it } from 'vitest';

const execFileAsync = promisify(execFile);

describe('generate-problem-loaders.mjs', () => {
  it('runs successfully and keeps generated files valid', async () => {
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
    expect(generated).toContain(
      "import { CATEGORY_PROBLEM_EXPORTS } from './__generated__/problem-routes.generated';"
    );
    expect(generated).toContain('export function loadProblemConfig');
    expect(generated).toContain("import('./__generated__/problem-loaders/array.generated')");

    const catalogGenerated = await readFile(
      path.join(cwd, 'src/lib/problems/problem-catalog.generated.ts'),
      'utf8'
    );
    expect(catalogGenerated).toContain('export const CATEGORY_PROBLEM_DATA');
    expect(catalogGenerated).toContain('export function getCategoryProblemData');
    expect(catalogGenerated).toContain("'leetcode-hot-100'");

    const routesGenerated = await readFile(
      path.join(cwd, 'src/lib/problems/__generated__/problem-routes.generated.ts'),
      'utf8'
    );
    expect(routesGenerated).toContain('export const CATEGORY_PROBLEM_EXPORTS');
    expect(routesGenerated).toContain("'array'");
    expect(routesGenerated).toContain("'two-sum'");

    const splitLoaderGenerated = await readFile(
      path.join(cwd, 'src/lib/problems/__generated__/problem-loaders/array.generated.ts'),
      'utf8'
    );
    expect(splitLoaderGenerated).toContain('export function loadCategoryProblemConfig');
    expect(splitLoaderGenerated).toContain("import('../../array/two-sum/index')");
  }, 20000);
});
