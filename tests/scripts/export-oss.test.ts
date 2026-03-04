import { execFile } from 'node:child_process';
import { readFile, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import { describe, expect, it } from 'vitest';

const execFileAsync = promisify(execFile);

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe('export-oss.mjs', () => {
  it('syncs incrementally and preserves untouched files', async () => {
    const cwd = process.cwd();
    const outDirName = '.tmp-export-oss-diff-test';
    const outDir = path.join(cwd, outDirName);
    const exportedReadme = path.join(outDir, 'README.md');
    const exportedLicense = path.join(outDir, 'LICENSE');
    const extraFile = path.join(outDir, 'extra.txt');

    await rm(outDir, { recursive: true, force: true });

    try {
      await execFileAsync(
        process.execPath,
        ['scripts/export-oss.mjs', '--out-dir', outDirName, '--skip-generate', '--skip-validate'],
        {
          cwd,
        }
      );

      const originalReadme = await readFile(path.join(cwd, 'README.md'), 'utf8');
      const untouchedBeforeStat = await stat(exportedLicense);

      await sleep(1200);
      await writeFile(exportedReadme, 'mutated by test\n', 'utf8');
      await writeFile(extraFile, 'remove me\n', 'utf8');

      await sleep(1200);
      await execFileAsync(
        process.execPath,
        ['scripts/export-oss.mjs', '--out-dir', outDirName, '--skip-generate', '--skip-validate'],
        {
          cwd,
        }
      );

      const syncedReadme = await readFile(exportedReadme, 'utf8');
      const untouchedAfterStat = await stat(exportedLicense);

      expect(syncedReadme).toBe(originalReadme);
      expect(untouchedAfterStat.mtimeMs).toBe(untouchedBeforeStat.mtimeMs);
      await expect(stat(extraFile)).rejects.toThrow();
    } finally {
      await rm(outDir, { recursive: true, force: true });
    }
  }, 30000);
});
