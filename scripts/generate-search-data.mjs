/**
 * Generate search-data.json from problem.json files.
 *
 * - Respects category order in categories.json
 * - Skips excluded categories (for example leetcode-hot-100)
 * - Keeps only problems that are loadable from problem-loaders.generated.ts
 * - De-duplicates by route key: `${category}/${id}`
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const problemsDir = path.resolve(__dirname, '../src/lib/problems');
const outputPath = path.join(problemsDir, 'search-data.json');
const loadersPath = path.join(problemsDir, 'problem-loaders.generated.ts');

const categoriesPath = path.join(problemsDir, 'categories.json');
const categoriesData = JSON.parse(fs.readFileSync(categoriesPath, 'utf-8'));
const CATEGORY_ORDER = categoriesData.map((cat) => cat.id);

const EXCLUDED_CATEGORIES = ['leetcode-hot-100'];

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

function parseLoadableRouteKeys() {
  if (!fs.existsSync(loadersPath)) {
    return null;
  }

  const content = fs.readFileSync(loadersPath, 'utf-8');
  const exportsSectionMatch = content.match(
    /export const CATEGORY_PROBLEM_EXPORTS:[\s\S]*?=\s*\{([\s\S]*?)\n\};/
  );

  if (!exportsSectionMatch) {
    return null;
  }

  const keys = new Set();
  const exportsBody = exportsSectionMatch[1];
  const categoryBlockRegex = /'([^']+)':\s*\{([\s\S]*?)\n\s*\},/g;

  let categoryMatch;
  while ((categoryMatch = categoryBlockRegex.exec(exportsBody))) {
    const categoryId = categoryMatch[1];
    const problemsBlock = categoryMatch[2];
    const problemKeyRegex = /'([^']+)':\s*'[^']+'/g;

    let problemMatch;
    while ((problemMatch = problemKeyRegex.exec(problemsBlock))) {
      keys.add(`${categoryId}/${problemMatch[1]}`);
    }
  }

  return keys;
}

async function main() {
  const searchData = [];
  const seenRouteKeys = new Set();
  const loadableKeys = parseLoadableRouteKeys();

  let skippedExcluded = 0;
  let skippedNotLoadable = 0;

  for (const category of CATEGORY_ORDER) {
    if (EXCLUDED_CATEGORIES.includes(category)) {
      skippedExcluded++;
      continue;
    }

    const problemJsonPath = path.join(problemsDir, category, 'problem.json');
    if (!fs.existsSync(problemJsonPath)) {
      continue;
    }

    try {
      const content = fs.readFileSync(problemJsonPath, 'utf-8');
      const problems = flattenProblemCollection(JSON.parse(content));

      for (const problem of problems) {
        const primaryCategory = problem.category || category;
        const routeKey = `${primaryCategory}/${problem.id}`;

        if (loadableKeys && !loadableKeys.has(routeKey)) {
          skippedNotLoadable++;
          continue;
        }

        if (seenRouteKeys.has(routeKey)) {
          continue;
        }

        seenRouteKeys.add(routeKey);
        searchData.push({
          id: problem.id,
          title: problem.title,
          category: primaryCategory,
        });
      }
    } catch (err) {
      console.error(`Failed to parse ${category}/problem.json:`, err.message);
    }
  }

  fs.writeFileSync(outputPath, JSON.stringify(searchData, null, 2) + '\n', 'utf-8');

  console.log(
    `Generated ${searchData.length} records -> search-data.json (excluded categories: ${skippedExcluded}, skipped non-loadable: ${skippedNotLoadable})`
  );
}

main().catch(console.error);
