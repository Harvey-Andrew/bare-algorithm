import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const problemsRoot = path.join(rootDir, 'src', 'lib', 'problems');
const outputFile = path.join(problemsRoot, 'problem-loaders.generated.ts');

const EXCLUDED_CATEGORIES = new Set(['leetcode-hot-100']);

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function collectEntries() {
  const categories = (await fs.readdir(problemsRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory() && !EXCLUDED_CATEGORIES.has(entry.name))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));

  const entries = [];

  for (const category of categories) {
    const categoryDir = path.join(problemsRoot, category);
    const problems = (await fs.readdir(categoryDir, { withFileTypes: true }))
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort((a, b) => a.localeCompare(b));

    for (const problem of problems) {
      const indexFile = path.join(categoryDir, problem, 'index.tsx');
      if (!(await exists(indexFile))) continue;

      const content = await fs.readFile(indexFile, 'utf8');
      const match = content.match(/export\s+const\s+([A-Za-z0-9_]+Config)\s*:/);

      if (!match) continue;

      entries.push({
        category,
        problem,
        exportName: match[1],
      });
    }
  }

  return entries;
}

function buildOutput(entries) {
  const grouped = new Map();

  for (const entry of entries) {
    if (!grouped.has(entry.category)) {
      grouped.set(entry.category, []);
    }
    grouped.get(entry.category).push(entry);
  }

  const categories = [...grouped.keys()].sort((a, b) => a.localeCompare(b));
  for (const category of categories) {
    grouped.get(category).sort((a, b) => a.problem.localeCompare(b.problem));
  }

  const lines = [];
  lines.push("import type { BaseFrame } from '@/types/algorithm';");
  lines.push("import type { AlgorithmConfig } from '@/types/visualizer';");
  lines.push('');
  lines.push('export type AnyAlgorithmConfig = AlgorithmConfig<unknown, BaseFrame>;');
  lines.push('type CategoryProblemExportMap = Record<string, string>;');
  lines.push('');
  lines.push('export const CATEGORY_PROBLEM_EXPORTS: Record<string, CategoryProblemExportMap> = {');

  for (const category of categories) {
    lines.push(`  '${category}': {`);
    for (const entry of grouped.get(category)) {
      lines.push(`    '${entry.problem}': '${entry.exportName}',`);
    }
    lines.push('  },');
  }

  lines.push('};');
  lines.push('');
  lines.push('const MODULE_LOADERS: Record<string, () => Promise<Record<string, unknown>>> = {');

  for (const category of categories) {
    for (const entry of grouped.get(category)) {
      lines.push(
        `  '${category}/${entry.problem}': () => import('./${category}/${entry.problem}/index') as Promise<Record<string, unknown>>,`
      );
    }
  }

  lines.push('};');
  lines.push('');
  lines.push('const configPromiseCache = new Map<string, Promise<AnyAlgorithmConfig | null>>();');
  lines.push('');
  lines.push(
    'export function loadProblemConfig(category: string, problem: string): Promise<AnyAlgorithmConfig | null> {'
  );
  lines.push('  const key = `${category}/${problem}`;');
  lines.push('  const categoryProblemExports = CATEGORY_PROBLEM_EXPORTS[category];');
  lines.push('  if (!categoryProblemExports) return Promise.resolve(null);');
  lines.push('');
  lines.push('  const exportName = categoryProblemExports[problem];');
  lines.push('  if (!exportName) return Promise.resolve(null);');
  lines.push('');
  lines.push('  const moduleLoader = MODULE_LOADERS[key];');
  lines.push('  if (!moduleLoader) return Promise.resolve(null);');
  lines.push('');
  lines.push('  const cached = configPromiseCache.get(key);');
  lines.push('  if (cached) return cached;');
  lines.push('');
  lines.push('  const promise = moduleLoader()');
  lines.push('    .then((module) => {');
  lines.push('      const config = module[exportName] as AnyAlgorithmConfig | undefined;');
  lines.push('      return config ?? null;');
  lines.push('    })');
  lines.push('    .catch(() => null);');
  lines.push('');
  lines.push('  configPromiseCache.set(key, promise);');
  lines.push('  return promise;');
  lines.push('}');
  lines.push('');

  return lines.join('\n');
}

async function main() {
  const entries = await collectEntries();
  const output = buildOutput(entries);
  await fs.writeFile(outputFile, output, 'utf8');
  console.log(`Generated ${entries.length} loaders -> ${path.relative(rootDir, outputFile)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
