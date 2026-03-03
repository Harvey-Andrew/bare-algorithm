import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const problemsDir = path.join(rootDir, 'src', 'lib', 'problems');

const strict = process.argv.includes('--strict');
const allowMissingLoaders = process.argv.includes('--allow-missing-loaders');

const issues = {
  error: [],
  warn: [],
};

function logIssue(level, message) {
  issues[level].push(message);
}

function logMismatch(message) {
  logIssue(strict ? 'error' : 'warn', message);
}

function readJson(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    logIssue('error', `Failed to parse JSON: ${toRelative(filePath)} (${error.message})`);
    return null;
  }
}

function toRelative(filePath) {
  return path.relative(rootDir, filePath).replace(/\\/g, '/');
}

function parseProblemLoaderKeys() {
  const loaderFile = path.join(problemsDir, 'problem-loaders.generated.ts');
  if (!fs.existsSync(loaderFile)) {
    logIssue(
      'error',
      'Missing src/lib/problems/problem-loaders.generated.ts. Run `pnpm generate:problem-loaders` first.'
    );
    return new Set();
  }

  const content = fs.readFileSync(loaderFile, 'utf8');

  // Backward compatibility: legacy generated file used `'category/problem': async () => ...` mapping.
  const legacyMatches = [...content.matchAll(/'([^']+)':\s*async\s*\(\)\s*=>/g)];
  if (legacyMatches.length > 0) {
    return new Set(legacyMatches.map((match) => match[1]));
  }

  // Current generated file exposes CATEGORY_PROBLEM_EXPORTS:
  // {
  //   'array': { 'two-sum': 'twoSumConfig', ... },
  //   ...
  // }
  const exportsSectionMatch = content.match(
    /export const CATEGORY_PROBLEM_EXPORTS:[\s\S]*?=\s*\{([\s\S]*?)\n\};/
  );
  if (!exportsSectionMatch) {
    logIssue(
      'error',
      'Unable to parse problem-loaders.generated.ts. Missing CATEGORY_PROBLEM_EXPORTS map.'
    );
    return new Set();
  }

  const loaderKeys = new Set();
  const exportsBody = exportsSectionMatch[1];
  const categoryBlockRegex = /'([^']+)':\s*\{([\s\S]*?)\n\s*\},/g;
  let categoryMatch;
  while ((categoryMatch = categoryBlockRegex.exec(exportsBody))) {
    const categoryId = categoryMatch[1];
    const problemsBlock = categoryMatch[2];

    const problemKeyRegex = /'([^']+)':\s*'[^']+'/g;
    let problemMatch;
    while ((problemMatch = problemKeyRegex.exec(problemsBlock))) {
      loaderKeys.add(`${categoryId}/${problemMatch[1]}`);
    }
  }

  if (loaderKeys.size === 0) {
    logIssue(
      'error',
      'Parsed CATEGORY_PROBLEM_EXPORTS but found zero loader keys in problem-loaders.generated.ts'
    );
  }

  return loaderKeys;
}

function isValidDifficulty(value) {
  return value === 'easy' || value === 'medium' || value === 'hard';
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
  if (!Array.isArray(data)) {
    return [];
  }

  if (isGuidedProblemCollection(data)) {
    return data.flatMap((stage) => stage.problems);
  }

  return data;
}

function resolveDemoPagePath(link) {
  const normalized = link.replace(/^\/+/, '');
  return path.join(rootDir, 'src', 'app', ...normalized.split('/'), 'page.tsx');
}

function validate() {
  const categoriesFile = path.join(problemsDir, 'categories.json');
  if (!fs.existsSync(categoriesFile)) {
    logIssue('error', 'Missing src/lib/problems/categories.json');
    return;
  }

  const categories = readJson(categoriesFile);
  if (!Array.isArray(categories)) {
    logIssue('error', 'categories.json must be an array');
    return;
  }

  const loaderKeys = parseProblemLoaderKeys();
  const expectedSearchKeys = new Set();
  const actualSearchKeys = new Set();
  const categoryIds = new Set();

  for (const category of categories) {
    if (!category || typeof category !== 'object') {
      logIssue('error', 'Found invalid category entry in categories.json');
      continue;
    }

    if (typeof category.id !== 'string' || category.id.length === 0) {
      logIssue('error', 'Found category without a valid `id` in categories.json');
      continue;
    }

    if (categoryIds.has(category.id)) {
      logIssue('error', `Duplicate category id: ${category.id}`);
      continue;
    }
    categoryIds.add(category.id);

    const categoryDir = path.join(problemsDir, category.id);
    if (!fs.existsSync(categoryDir)) {
      logIssue('error', `Category directory does not exist: src/lib/problems/${category.id}`);
      continue;
    }

    const problemFile = path.join(categoryDir, 'problem.json');
    if (!fs.existsSync(problemFile)) {
      logIssue('error', `Missing ${toRelative(problemFile)}`);
      continue;
    }

    const problemEntries = readJson(problemFile);
    if (!Array.isArray(problemEntries)) {
      logIssue('error', `${toRelative(problemFile)} must be an array`);
      continue;
    }

    const problems = flattenProblemCollection(problemEntries);

    if (typeof category.problemCount === 'number' && category.problemCount !== problems.length) {
      logMismatch(
        `problemCount mismatch for ${category.id}: categories.json=${category.problemCount}, problem.json=${problems.length}`
      );
    }

    const problemIdsInCategory = new Set();
    const shouldValidateLoader = category.id !== 'leetcode-hot-100';
    for (const problem of problems) {
      if (!problem || typeof problem !== 'object') {
        logIssue('error', `Invalid problem entry in ${toRelative(problemFile)}`);
        continue;
      }

      const problemId = problem.id;
      if (typeof problemId !== 'string' || problemId.length === 0) {
        logIssue('error', `Problem without valid id in ${toRelative(problemFile)}`);
        continue;
      }

      if (problemIdsInCategory.has(problemId)) {
        logIssue('error', `Duplicate problem id in ${category.id}: ${problemId}`);
        continue;
      }
      problemIdsInCategory.add(problemId);

      if (typeof problem.title !== 'string' || problem.title.length === 0) {
        logIssue('error', `Missing title for ${category.id}/${problemId}`);
      }

      if (!isValidDifficulty(problem.difficulty)) {
        logIssue(
          'error',
          `Invalid difficulty for ${category.id}/${problemId}: ${String(problem.difficulty)}`
        );
      }

      if (typeof problem.category !== 'string' || problem.category.length === 0) {
        logIssue('error', `Missing category field for ${category.id}/${problemId}`);
        continue;
      }

      const routeCategory = problem.category;
      const loaderKey = `${routeCategory}/${problemId}`;

      if (shouldValidateLoader && !loaderKeys.has(loaderKey)) {
        if (!allowMissingLoaders) {
          logMismatch(`Missing loader for route key: ${loaderKey} (declared in ${category.id})`);
        }
      } else if (category.id !== 'leetcode-hot-100') {
        expectedSearchKeys.add(loaderKey);
      }
    }

    const applicationsFile = path.join(categoryDir, 'applications.json');
    let validApplicationCount = 0;

    if (fs.existsSync(applicationsFile)) {
      const applications = readJson(applicationsFile);
      if (!Array.isArray(applications)) {
        logIssue('error', `${toRelative(applicationsFile)} must be an array`);
      } else {
        const appIdsInCategory = new Set();
        for (const app of applications) {
          if (!app || typeof app !== 'object') {
            logIssue('error', `Invalid application entry in ${toRelative(applicationsFile)}`);
            continue;
          }

          if (typeof app.id !== 'string' || app.id.length === 0) {
            logIssue('error', `Application without valid id in ${toRelative(applicationsFile)}`);
            continue;
          }

          if (appIdsInCategory.has(app.id)) {
            logIssue('error', `Duplicate application id in ${category.id}: ${app.id}`);
          }
          appIdsInCategory.add(app.id);

          if (!isValidDifficulty(app.difficulty)) {
            logIssue(
              'error',
              `Invalid difficulty for application ${category.id}/${app.id}: ${String(app.difficulty)}`
            );
          }

          if (typeof app.link !== 'string' || app.link.length === 0) {
            logMismatch(`Missing link for application ${category.id}/${app.id}`);
            continue;
          }

          if (!app.link.startsWith('/demo/')) {
            logMismatch(
              `Application link should start with /demo/: ${category.id}/${app.id} -> ${app.link}`
            );
            continue;
          }

          const appPagePath = resolveDemoPagePath(app.link);
          if (!fs.existsSync(appPagePath)) {
            logMismatch(
              `Application page missing: ${category.id}/${app.id} -> ${toRelative(appPagePath)}`
            );
            continue;
          }

          validApplicationCount++;
        }
      }
    }

    if (
      typeof category.applicationCount === 'number' &&
      category.applicationCount !== validApplicationCount
    ) {
      logMismatch(
        `applicationCount mismatch for ${category.id}: categories.json=${category.applicationCount}, valid demo pages=${validApplicationCount}`
      );
    }
  }

  const searchDataFile = path.join(problemsDir, 'search-data.json');
  if (!fs.existsSync(searchDataFile)) {
    logIssue(
      'error',
      'Missing src/lib/problems/search-data.json. Run `pnpm generate:search-data` first.'
    );
  } else {
    const searchData = readJson(searchDataFile);
    if (!Array.isArray(searchData)) {
      logIssue('error', 'search-data.json must be an array');
    } else {
      for (const item of searchData) {
        if (!item || typeof item !== 'object') {
          logIssue('error', 'Invalid search-data entry');
          continue;
        }

        if (
          typeof item.id !== 'string' ||
          typeof item.category !== 'string' ||
          typeof item.title !== 'string'
        ) {
          logIssue('error', 'Malformed search-data entry (id/category/title required)');
          continue;
        }

        actualSearchKeys.add(`${item.category}/${item.id}`);
      }

      for (const key of expectedSearchKeys) {
        if (!actualSearchKeys.has(key)) {
          logMismatch(`search-data missing loadable problem: ${key}`);
        }
      }

      for (const key of actualSearchKeys) {
        if (!expectedSearchKeys.has(key)) {
          logMismatch(`search-data contains non-loadable or stale problem: ${key}`);
        }
      }
    }
  }
}

validate();

for (const message of issues.error) {
  console.error(`ERROR: ${message}`);
}
for (const message of issues.warn) {
  console.warn(`WARN: ${message}`);
}

if (issues.error.length === 0 && issues.warn.length === 0) {
  console.log('Content consistency check passed with no issues.');
} else {
  console.log(
    `Content consistency check finished. errors=${issues.error.length}, warnings=${issues.warn.length}, strict=${strict}`
  );
}

if (issues.error.length > 0) {
  process.exitCode = 1;
}
