import path from 'path';

import { CATEGORY_PROBLEM_EXPORTS } from '@/lib/problems/problem-loaders.generated';

const SAFE_PROBLEM_ID_PATTERN = /^[a-z0-9-]+$/;
const PROBLEMS_ROOT = path.join(process.cwd(), 'src', 'lib', 'problems');

function isPathInside(parentPath: string, childPath: string): boolean {
  const relativePath = path.relative(parentPath, childPath);
  return relativePath === '' || (!relativePath.startsWith('..') && !path.isAbsolute(relativePath));
}

function resolveProblemsPath(...segments: string[]): string | null {
  const resolvedPath = path.resolve(PROBLEMS_ROOT, ...segments);
  return isPathInside(PROBLEMS_ROOT, resolvedPath) ? resolvedPath : null;
}

export function isSafeProblemId(value: string): boolean {
  return SAFE_PROBLEM_ID_PATTERN.test(value);
}

export function isKnownProblemRoute(category: string, problem: string): boolean {
  if (!isSafeProblemId(category) || !isSafeProblemId(problem)) {
    return false;
  }

  return Boolean(CATEGORY_PROBLEM_EXPORTS[category]?.[problem]);
}

export function getAllProblemRouteParams(): Array<{ category: string; problem: string }> {
  return Object.entries(CATEGORY_PROBLEM_EXPORTS).flatMap(([category, problems]) =>
    Object.keys(problems).map((problem) => ({ category, problem }))
  );
}

export function getProblemJsonPath(category: string): string | null {
  if (!isSafeProblemId(category)) {
    return null;
  }

  return resolveProblemsPath(category, 'problem.json');
}

export function getSolutionContentPaths(category: string, problem: string): string[] {
  if (!isSafeProblemId(category) || !isSafeProblemId(problem)) {
    return [];
  }

  return [
    resolveProblemsPath(category, `${problem}.md`),
    resolveProblemsPath(category, problem, 'solution.md'),
  ].filter((filePath): filePath is string => Boolean(filePath));
}
