import { execFile as execFileCallback } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';

const execFile = promisify(execFileCallback);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const DEFAULT_CONFIG_PATH = path.join(rootDir, 'scripts', 'oss-export.config.json');
const DEFAULT_OUT_DIR = path.join(rootDir, 'bare-algorithm');
const MANAGED_EXPORT_DIR_PREFIXES = ['.oss-export', 'bare-algorithm'];

function toPosix(filePath) {
  return filePath.replace(/\\/g, '/');
}

function isPathInside(parentPath, childPath) {
  const relativePath = path.relative(parentPath, childPath);
  return relativePath === '' || (!relativePath.startsWith('..') && !path.isAbsolute(relativePath));
}

function resolvePathWithin(baseDir, targetPath) {
  const resolvedPath = path.resolve(baseDir, targetPath);
  return isPathInside(baseDir, resolvedPath) ? resolvedPath : null;
}

function shouldSkipSourcePath(rootDirForCopy, sourcePath, context) {
  const relPath = toPosix(path.relative(rootDirForCopy, sourcePath));
  const topLevelName = relPath.split('/')[0];

  return (
    MANAGED_EXPORT_DIR_PREFIXES.some((prefix) => topLevelName.startsWith(prefix)) ||
    context.excludeTopLevel.has(topLevelName)
  );
}

function parseArgs(argv) {
  const args = {
    configPath: DEFAULT_CONFIG_PATH,
    outDir: DEFAULT_OUT_DIR,
    skipGenerate: false,
    skipValidate: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const current = argv[i];

    if (current === '--config') {
      args.configPath = path.resolve(rootDir, argv[++i] || '');
      continue;
    }

    if (current === '--out-dir') {
      args.outDir = path.resolve(rootDir, argv[++i] || '');
      continue;
    }

    if (current === '--skip-generate') {
      args.skipGenerate = true;
      continue;
    }

    if (current === '--skip-validate') {
      args.skipValidate = true;
      continue;
    }

    throw new Error(`Unknown argument: ${current}`);
  }

  return args;
}

async function pathExists(targetPath) {
  try {
    await fs.promises.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function readJson(filePath) {
  const content = await fs.promises.readFile(filePath, 'utf8');
  return JSON.parse(content);
}

async function writeJson(filePath, value) {
  await fs.promises.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

async function readDirEntriesSafe(dirPath) {
  if (!(await pathExists(dirPath))) {
    return [];
  }

  return fs.promises.readdir(dirPath, { withFileTypes: true });
}

async function lstatSafe(targetPath) {
  try {
    return await fs.promises.lstat(targetPath);
  } catch {
    return null;
  }
}

async function removePath(targetPath) {
  await fs.promises.rm(targetPath, { recursive: true, force: true });
}

async function filesAreEqual(sourcePath, targetPath, sourceStat, targetStat) {
  if (!targetStat?.isFile()) {
    return false;
  }

  if (sourceStat.size !== targetStat.size) {
    return false;
  }

  const [sourceContent, targetContent] = await Promise.all([
    fs.promises.readFile(sourcePath),
    fs.promises.readFile(targetPath),
  ]);

  return sourceContent.equals(targetContent);
}

async function syncFile(sourcePath, targetPath) {
  const sourceStat = await fs.promises.stat(sourcePath);
  const targetStat = await lstatSafe(targetPath);

  if (targetStat && !targetStat.isFile()) {
    await removePath(targetPath);
  } else if (targetStat && (await filesAreEqual(sourcePath, targetPath, sourceStat, targetStat))) {
    if ((targetStat.mode & 0o777) !== (sourceStat.mode & 0o777)) {
      await fs.promises.chmod(targetPath, sourceStat.mode);
    }
    return;
  }

  await fs.promises.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.promises.copyFile(sourcePath, targetPath);
  await fs.promises.chmod(targetPath, sourceStat.mode);
}

async function syncSymlink(sourcePath, targetPath) {
  const sourceLinkTarget = await fs.promises.readlink(sourcePath);
  const targetStat = await lstatSafe(targetPath);

  if (targetStat?.isSymbolicLink()) {
    const targetLinkTarget = await fs.promises.readlink(targetPath);
    if (targetLinkTarget === sourceLinkTarget) {
      return;
    }
  }

  if (targetStat) {
    await removePath(targetPath);
  }

  await fs.promises.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.promises.symlink(sourceLinkTarget, targetPath);
}

function isGuidedProblemCollection(data) {
  return (
    Array.isArray(data) &&
    data.length > 0 &&
    data.every(
      (item) =>
        item &&
        typeof item === 'object' &&
        typeof item.id === 'string' &&
        Array.isArray(item.problems)
    )
  );
}

function flattenProblemCollection(data) {
  if (!Array.isArray(data)) return [];
  if (isGuidedProblemCollection(data)) {
    return data.flatMap((stage) => stage.problems);
  }
  return data;
}

function collectProblemIds(problemEntries) {
  return new Set(
    flattenProblemCollection(problemEntries)
      .map((item) => item?.id)
      .filter((id) => typeof id === 'string')
  );
}

function filterProblemEntries(problemEntries, keepIds, dropEmptyGuidedStages) {
  if (isGuidedProblemCollection(problemEntries)) {
    const filteredStages = problemEntries.map((stage) => ({
      ...stage,
      problems: stage.problems.filter((problem) => keepIds.has(problem.id)),
    }));

    return dropEmptyGuidedStages
      ? filteredStages.filter((stage) => stage.problems.length > 0)
      : filteredStages;
  }

  return problemEntries.filter((problem) => keepIds.has(problem.id));
}

async function syncDirectoryRecursive(srcDir, dstDir, context, options = {}) {
  const preserveEntryNames = options.preserveEntryNames || new Set();
  const targetStat = await lstatSafe(dstDir);

  if (targetStat && !targetStat.isDirectory()) {
    await removePath(dstDir);
  }

  await fs.promises.mkdir(dstDir, { recursive: true });

  const sourceEntries = await fs.promises.readdir(srcDir, { withFileTypes: true });
  const desiredEntries = sourceEntries.filter(
    (entry) => !shouldSkipSourcePath(context.rootDir, path.join(srcDir, entry.name), context)
  );
  const desiredNames = new Set(desiredEntries.map((entry) => entry.name));
  const targetEntries = await readDirEntriesSafe(dstDir);

  for (const targetEntry of targetEntries) {
    if (preserveEntryNames.has(targetEntry.name)) {
      continue;
    }

    if (!desiredNames.has(targetEntry.name)) {
      await removePath(path.join(dstDir, targetEntry.name));
    }
  }

  for (const entry of desiredEntries) {
    const sourcePath = path.join(srcDir, entry.name);
    const targetPath = path.join(dstDir, entry.name);

    if (entry.isDirectory()) {
      await syncDirectoryRecursive(sourcePath, targetPath, context);
      continue;
    }

    if (entry.isSymbolicLink()) {
      await syncSymlink(sourcePath, targetPath);
      continue;
    }

    await syncFile(sourcePath, targetPath);
  }
}

async function removeConfiguredPaths(outDir, removePaths) {
  for (const relPath of removePaths) {
    const absolutePath = resolvePathWithin(outDir, relPath);
    if (!absolutePath) {
      throw new Error(`Refusing to remove path outside export directory: ${relPath}`);
    }

    if (await pathExists(absolutePath)) {
      await fs.promises.rm(absolutePath, { recursive: true, force: true });
    }
  }
}

async function cleanupProblemMarkdown(problemDir, fileNames) {
  if (!Array.isArray(fileNames) || fileNames.length === 0) return;

  for (const fileName of fileNames) {
    const target = resolvePathWithin(problemDir, fileName);
    if (!target) {
      throw new Error(`Refusing to remove markdown outside problem directory: ${fileName}`);
    }

    if (await pathExists(target)) {
      await fs.promises.rm(target, { force: true });
    }
  }
}

function getCategoryProblemAllowlist(problemExportConfig) {
  if (!problemExportConfig || problemExportConfig.mode !== 'allowlist') {
    return new Map();
  }

  const allowlist = problemExportConfig.allowlist || {};
  const allowMap = new Map();
  for (const [categoryId, ids] of Object.entries(allowlist)) {
    if (!Array.isArray(ids)) continue;
    allowMap.set(categoryId, new Set(ids.filter((id) => typeof id === 'string' && id.length > 0)));
  }
  return allowMap;
}

async function pruneProblems(outDir, config) {
  const problemsRoot = path.join(outDir, 'src', 'lib', 'problems');
  const categoriesFile = path.join(problemsRoot, 'categories.json');
  const categories = await readJson(categoriesFile);
  const problemExportConfig = config.problemExport || {};
  const allowMap = getCategoryProblemAllowlist(problemExportConfig);
  const dropEmptyGuidedStages = problemExportConfig.dropEmptyGuidedStages !== false;
  const removeApplicationsJson = Boolean(problemExportConfig.removeApplicationsJson);
  const removeTheoryJson = Boolean(problemExportConfig.removeTheoryJson);
  const removeCategoryBarrelFiles = problemExportConfig.removeCategoryBarrelFiles !== false;
  const removeMarkdownFileNames = Array.isArray(problemExportConfig.removeMarkdownFileNames)
    ? problemExportConfig.removeMarkdownFileNames
    : [];
  const preserveProblemMetadata = Boolean(
    problemExportConfig.preserveProblemMetadata || problemExportConfig.preserveEmptyCategories
  );

  const summary = {
    keptCategories: 0,
    removedCategories: 0,
    keptProblems: 0,
    removedProblems: 0,
    warnings: [],
  };

  const keptCategoryIds = new Set();
  const categoryProblemCount = new Map();

  for (const categoryMeta of categories) {
    const categoryId = categoryMeta?.id;
    if (typeof categoryId !== 'string' || categoryId.length === 0) {
      continue;
    }

    const categoryDir = path.join(problemsRoot, categoryId);
    const problemJsonPath = path.join(categoryDir, 'problem.json');

    if (!(await pathExists(problemJsonPath))) {
      continue;
    }

    const allowedIds = allowMap.get(categoryId) || new Set();
    if (problemExportConfig.mode === 'allowlist' && allowedIds.size === 0) {
      if (!preserveProblemMetadata) {
        await fs.promises.rm(categoryDir, { recursive: true, force: true });
        summary.removedCategories++;
        continue;
      }
    }

    const problemEntries = await readJson(problemJsonPath);
    const originalIds = collectProblemIds(problemEntries);
    const keepIds = new Set([...allowedIds].filter((id) => originalIds.has(id)));

    for (const allowedId of allowedIds) {
      if (!originalIds.has(allowedId)) {
        summary.warnings.push(`allowlist id not found: ${categoryId}/${allowedId}`);
      }
    }

    if (keepIds.size === 0) {
      if (!preserveProblemMetadata) {
        await fs.promises.rm(categoryDir, { recursive: true, force: true });
        summary.removedCategories++;
        summary.removedProblems += originalIds.size;
        continue;
      } else {
        summary.removedProblems += originalIds.size;
      }
    } else {
      if (!preserveProblemMetadata) {
        const filteredEntries = filterProblemEntries(
          problemEntries,
          keepIds,
          dropEmptyGuidedStages
        );
        await writeJson(problemJsonPath, filteredEntries);
      }
    }

    const entries = await fs.promises.readdir(categoryDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      const problemDir = path.join(categoryDir, entry.name);
      const hasProblemShape =
        (await pathExists(path.join(problemDir, 'index.tsx'))) ||
        (await pathExists(path.join(problemDir, 'frames.ts'))) ||
        (await pathExists(path.join(problemDir, 'constants.ts')));

      if (!hasProblemShape) continue;

      if (!keepIds.has(entry.name)) {
        await fs.promises.rm(problemDir, { recursive: true, force: true });
      } else {
        await cleanupProblemMarkdown(problemDir, removeMarkdownFileNames);
      }
    }

    if (removeApplicationsJson) {
      await fs.promises.rm(path.join(categoryDir, 'applications.json'), { force: true });
    }

    if (removeTheoryJson) {
      await fs.promises.rm(path.join(categoryDir, 'theory.json'), { force: true });
    }

    if (removeCategoryBarrelFiles) {
      await fs.promises.rm(path.join(categoryDir, 'index.ts'), { force: true });
    }

    keptCategoryIds.add(categoryId);
    categoryProblemCount.set(categoryId, keepIds.size);
    summary.keptProblems += keepIds.size;
    summary.removedProblems += Math.max(0, originalIds.size - keepIds.size);
  }

  const filteredCategories = preserveProblemMetadata
    ? categories
    : categories.filter((categoryMeta) => keptCategoryIds.has(categoryMeta.id));

  if (!preserveProblemMetadata) {
    for (const categoryMeta of filteredCategories) {
      if (typeof categoryMeta.problemCount === 'number') {
        categoryMeta.problemCount = categoryProblemCount.get(categoryMeta.id) || 0;
      }
      if (typeof categoryMeta.count === 'number') {
        categoryMeta.count = categoryProblemCount.get(categoryMeta.id) || 0;
      }
      if (removeApplicationsJson && typeof categoryMeta.applicationCount === 'number') {
        categoryMeta.applicationCount = 0;
      }
    }
    await writeJson(categoriesFile, filteredCategories);
  }

  summary.keptCategories = filteredCategories.length;
  return summary;
}

async function runNodeScript(cwd, scriptRelPath, extraArgs = []) {
  const scriptPath = path.join(cwd, scriptRelPath);
  if (!(await pathExists(scriptPath))) {
    throw new Error(`Script not found: ${scriptRelPath}`);
  }

  const { stdout, stderr } = await execFile(process.execPath, [scriptPath, ...extraArgs], {
    cwd,
    maxBuffer: 1024 * 1024 * 16,
  });

  if (stdout.trim().length > 0) {
    process.stdout.write(stdout);
  }
  if (stderr.trim().length > 0) {
    process.stderr.write(stderr);
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!isPathInside(rootDir, args.outDir) || args.outDir === rootDir) {
    throw new Error('OSS export output directory must stay inside the repository root.');
  }

  const config = await readJson(args.configPath);
  const copyConfig = config.copy || {};
  const excludeTopLevel = new Set(
    [
      '.git',
      'node_modules',
      '.next',
      'coverage',
      'test-results',
      '.tmp-chrome-run',
      ...(Array.isArray(copyConfig.excludeTopLevel) ? copyConfig.excludeTopLevel : []),
    ].filter(Boolean)
  );

  if (isPathInside(rootDir, args.outDir)) {
    const outDirRel = toPosix(path.relative(rootDir, args.outDir));
    const outTopLevel = outDirRel.split('/')[0];
    if (outTopLevel) {
      excludeTopLevel.add(outTopLevel);
    }
  }

  await syncDirectoryRecursive(
    rootDir,
    args.outDir,
    {
      rootDir,
      excludeTopLevel,
    },
    { preserveEntryNames: new Set(['.git']) }
  );

  await removeConfiguredPaths(
    args.outDir,
    Array.isArray(config.removePaths) ? config.removePaths : []
  );
  const pruneSummary = await pruneProblems(args.outDir, config);

  if (!args.skipGenerate) {
    await runNodeScript(args.outDir, path.join('scripts', 'generate-problem-loaders.mjs'));
    await runNodeScript(args.outDir, path.join('scripts', 'generate-search-data.mjs'));
  }

  if (!args.skipValidate) {
    const validateArgs = ['--strict'];
    if (
      config.problemExport?.preserveProblemMetadata ||
      config.problemExport?.preserveEmptyCategories
    ) {
      validateArgs.push('--allow-missing-loaders');
    }
    await runNodeScript(
      args.outDir,
      path.join('scripts', 'validate-content-consistency.mjs'),
      validateArgs
    );
  }

  console.log('\nOSS export summary');
  console.log(`- Output directory: ${toPosix(args.outDir)}`);
  console.log(`- Kept categories: ${pruneSummary.keptCategories}`);
  console.log(`- Removed categories: ${pruneSummary.removedCategories}`);
  console.log(`- Kept problems: ${pruneSummary.keptProblems}`);
  console.log(`- Removed problems: ${pruneSummary.removedProblems}`);
  if (pruneSummary.warnings.length > 0) {
    console.log('- Warnings:');
    for (const warning of pruneSummary.warnings) {
      console.log(`  - ${warning}`);
    }
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
