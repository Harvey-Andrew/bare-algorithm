import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const problemsRoot = path.join(rootDir, 'src', 'lib', 'problems');
const loadersOutputFile = path.join(problemsRoot, 'problem-loaders.generated.ts');
const catalogOutputFile = path.join(problemsRoot, 'problem-catalog.generated.ts');
const routesOutputFile = path.join(problemsRoot, '__generated__', 'problem-routes.generated.ts');
const splitLoadersDir = path.join(problemsRoot, '__generated__', 'problem-loaders');

const EXCLUDED_LOADER_CATEGORIES = new Set(['leetcode-hot-100']);

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
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('__'))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));

  const entries = [];
  const categoryJsonEntries = [];

  for (const category of categories) {
    const categoryDir = path.join(problemsRoot, category);
    for (const fileName of ['problem.json', 'applications.json', 'theory.json']) {
      const filePath = path.join(categoryDir, fileName);
      if (await exists(filePath)) {
        categoryJsonEntries.push({
          category,
          fileName,
        });
      }
    }

    if (EXCLUDED_LOADER_CATEGORIES.has(category)) {
      continue;
    }

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

  return { entries, categoryJsonEntries };
}

function toIdentifier(input) {
  return input
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((segment, index) => {
      const normalized = segment.toLowerCase();
      return index === 0 ? normalized : normalized[0].toUpperCase() + normalized.slice(1);
    })
    .join('');
}

function groupEntriesByCategory(entries) {
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

  return { grouped, categories };
}

function buildLoadersIndexOutput(entries) {
  const { categories } = groupEntriesByCategory(entries);

  const lines = [];
  lines.push("import type { BaseFrame } from '@/types/algorithm';");
  lines.push("import type { AlgorithmConfig } from '@/types/visualizer';");
  lines.push(
    "import { CATEGORY_PROBLEM_EXPORTS } from './__generated__/problem-routes.generated';"
  );
  lines.push('');
  lines.push('export type AnyAlgorithmConfig = AlgorithmConfig<unknown, BaseFrame>;');
  lines.push('');
  lines.push(
    'type CategoryLoaderModule = { loadCategoryProblemConfig: (problem: string) => Promise<AnyAlgorithmConfig | null> };'
  );
  lines.push('');
  lines.push('const CATEGORY_LOADERS: Record<string, () => Promise<CategoryLoaderModule>> = {');

  for (const category of categories) {
    lines.push(
      `  '${category}': () => import('./__generated__/problem-loaders/${category}.generated') as Promise<CategoryLoaderModule>,`
    );
  }

  lines.push('};');
  lines.push('');
  lines.push(
    'const categoryLoaderPromiseCache = new Map<string, Promise<CategoryLoaderModule | null>>();'
  );
  lines.push('const configPromiseCache = new Map<string, Promise<AnyAlgorithmConfig | null>>();');
  lines.push('');
  lines.push(
    'function loadCategoryLoader(category: string): Promise<CategoryLoaderModule | null> {'
  );
  lines.push('  const loader = CATEGORY_LOADERS[category];');
  lines.push('  if (!loader) return Promise.resolve(null);');
  lines.push('');
  lines.push('  const cached = categoryLoaderPromiseCache.get(category);');
  lines.push('  if (cached) return cached;');
  lines.push('');
  lines.push('  const promise = loader().catch(() => null);');
  lines.push('  categoryLoaderPromiseCache.set(category, promise);');
  lines.push('  return promise;');
  lines.push('}');
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
  lines.push('  const cached = configPromiseCache.get(key);');
  lines.push('  if (cached) return cached;');
  lines.push('');
  lines.push('  const promise = loadCategoryLoader(category)');
  lines.push('    .then((module) => module?.loadCategoryProblemConfig(problem) ?? null)');
  lines.push('    .catch(() => null);');
  lines.push('');
  lines.push('  configPromiseCache.set(key, promise);');
  lines.push('  return promise;');
  lines.push('}');
  lines.push('');

  return lines.join('\n');
}

function buildRoutesOutput(entries) {
  const { grouped, categories } = groupEntriesByCategory(entries);

  const lines = [];
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

  return lines.join('\n');
}

function buildCategoryLoaderOutput(category, entries) {
  const lines = [];
  lines.push("import type { BaseFrame } from '@/types/algorithm';");
  lines.push("import type { AlgorithmConfig } from '@/types/visualizer';");
  lines.push('');
  lines.push('export type AnyAlgorithmConfig = AlgorithmConfig<unknown, BaseFrame>;');
  lines.push('type ProblemExportMap = Record<string, string>;');
  lines.push('');
  lines.push('export const CATEGORY_PROBLEM_EXPORTS: ProblemExportMap = {');

  for (const entry of entries) {
    lines.push(`  '${entry.problem}': '${entry.exportName}',`);
  }

  lines.push('};');
  lines.push('');
  lines.push('const MODULE_LOADERS: Record<string, () => Promise<Record<string, unknown>>> = {');

  for (const entry of entries) {
    lines.push(
      `  '${entry.problem}': () => import('../../${category}/${entry.problem}/index') as Promise<Record<string, unknown>>,`
    );
  }

  lines.push('};');
  lines.push('');
  lines.push('const configPromiseCache = new Map<string, Promise<AnyAlgorithmConfig | null>>();');
  lines.push('');
  lines.push(
    'export function loadCategoryProblemConfig(problem: string): Promise<AnyAlgorithmConfig | null> {'
  );
  lines.push('  const exportName = CATEGORY_PROBLEM_EXPORTS[problem];');
  lines.push('  if (!exportName) return Promise.resolve(null);');
  lines.push('');
  lines.push('  const moduleLoader = MODULE_LOADERS[problem];');
  lines.push('  if (!moduleLoader) return Promise.resolve(null);');
  lines.push('');
  lines.push('  const cached = configPromiseCache.get(problem);');
  lines.push('  if (cached) return cached;');
  lines.push('');
  lines.push('  const promise = moduleLoader()');
  lines.push('    .then((module) => {');
  lines.push('      const config = module[exportName] as AnyAlgorithmConfig | undefined;');
  lines.push('      return config ?? null;');
  lines.push('    })');
  lines.push('    .catch(() => null);');
  lines.push('');
  lines.push('  configPromiseCache.set(problem, promise);');
  lines.push('  return promise;');
  lines.push('}');
  lines.push('');

  return lines.join('\n');
}

function buildCatalogOutput(categoryJsonEntries) {
  const groupedByFileName = {
    'problem.json': [],
    'applications.json': [],
    'theory.json': [],
  };

  for (const entry of categoryJsonEntries) {
    groupedByFileName[entry.fileName].push(entry);
  }

  for (const value of Object.values(groupedByFileName)) {
    value.sort((a, b) => a.category.localeCompare(b.category));
  }

  const importLines = [];
  for (const { category, fileName } of categoryJsonEntries) {
    const baseName = fileName.replace('.json', '');
    const identifier = `${toIdentifier(category)}${toIdentifier(baseName)}Data`;
    importLines.push(`import ${identifier} from './${category}/${fileName}';`);
  }

  const lines = [...importLines];
  lines.push('');
  lines.push('type CategoryJsonMap = Record<string, unknown[]>;');
  lines.push('');

  const mapDefinitions = [
    ['CATEGORY_PROBLEM_DATA', 'problem.json', 'problem'],
    ['CATEGORY_APPLICATIONS_DATA', 'applications.json', 'applications'],
    ['CATEGORY_THEORY_DATA', 'theory.json', 'theory'],
  ];

  for (const [exportName, fileName, suffix] of mapDefinitions) {
    lines.push(`export const ${exportName}: CategoryJsonMap = {`);
    for (const { category } of groupedByFileName[fileName]) {
      const identifier = `${toIdentifier(category)}${toIdentifier(suffix)}Data`;
      lines.push(`  '${category}': ${identifier} as unknown[],`);
    }
    lines.push('};');
    lines.push('');
  }

  lines.push('export function getCategoryProblemData(category: string): unknown[] {');
  lines.push('  return CATEGORY_PROBLEM_DATA[category] ?? [];');
  lines.push('}');
  lines.push('');
  lines.push('export function getCategoryApplicationsData(category: string): unknown[] {');
  lines.push('  return CATEGORY_APPLICATIONS_DATA[category] ?? [];');
  lines.push('}');
  lines.push('');
  lines.push('export function getCategoryTheoryData(category: string): unknown[] {');
  lines.push('  return CATEGORY_THEORY_DATA[category] ?? [];');
  lines.push('}');
  lines.push('');

  return lines.join('\n');
}

async function writeCategoryLoaders(entries) {
  const { grouped, categories } = groupEntriesByCategory(entries);

  await fs.rm(splitLoadersDir, { recursive: true, force: true });
  await fs.mkdir(splitLoadersDir, { recursive: true });

  await Promise.all(
    categories.map((category) =>
      fs.writeFile(
        path.join(splitLoadersDir, `${category}.generated.ts`),
        buildCategoryLoaderOutput(category, grouped.get(category)),
        'utf8'
      )
    )
  );

  return categories.length;
}

async function main() {
  const { entries, categoryJsonEntries } = await collectEntries();
  const loadersOutput = buildLoadersIndexOutput(entries);
  const catalogOutput = buildCatalogOutput(categoryJsonEntries);
  const routesOutput = buildRoutesOutput(entries);
  const splitLoaderCount = await writeCategoryLoaders(entries);
  await fs.mkdir(path.dirname(routesOutputFile), { recursive: true });

  await Promise.all([
    fs.writeFile(loadersOutputFile, loadersOutput, 'utf8'),
    fs.writeFile(catalogOutputFile, catalogOutput, 'utf8'),
    fs.writeFile(routesOutputFile, routesOutput, 'utf8'),
  ]);

  console.log(
    `Generated ${entries.length} loaders, ${splitLoaderCount} split loader modules and ${categoryJsonEntries.length} category datasets -> ${path.relative(rootDir, loadersOutputFile)}, ${path.relative(rootDir, catalogOutputFile)}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
