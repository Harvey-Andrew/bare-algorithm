import type { CategoryGuideMeta, ProblemMeta, StudyStageWithProblems } from '@/types/problem';

export type NormalizedProblemMeta = ProblemMeta & { externalLinks: string };

function isObjectLike(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function isGuidedProblemCollection(data: unknown[]): data is CategoryGuideMeta[] {
  return (
    data.length > 0 &&
    data.every(
      (item) =>
        isObjectLike(item) &&
        typeof item.id === 'string' &&
        typeof item.title === 'string' &&
        typeof item.description === 'string' &&
        Array.isArray(item.problems)
    )
  );
}

export function flattenProblemCollection(data: unknown[]): ProblemMeta[] {
  if (isGuidedProblemCollection(data)) {
    return data.flatMap((stage) => stage.problems);
  }

  return data.filter(
    (item): item is ProblemMeta =>
      isObjectLike(item) &&
      typeof item.id === 'string' &&
      typeof item.title === 'string' &&
      typeof item.difficulty === 'string' &&
      typeof item.category === 'string' &&
      Array.isArray(item.tags)
  );
}

export function buildStudyStages(data: unknown[]): StudyStageWithProblems[] {
  if (!isGuidedProblemCollection(data)) {
    return [];
  }

  return data.map((stage) => ({
    id: stage.id,
    title: stage.title,
    description: stage.description,
    problems: stage.problems,
  }));
}

export function findProblemMeta(
  data: unknown[],
  problemId: string
): NormalizedProblemMeta | undefined {
  const problem = flattenProblemCollection(data).find((item) => item.id === problemId);

  if (!problem) {
    return undefined;
  }

  return {
    ...problem,
    externalLinks: problem.externalLinks ?? '',
  };
}
