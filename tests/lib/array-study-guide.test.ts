import { describe, expect, it } from 'vitest';

import arrayProblemData from '@/lib/problems/array/problem.json';
import { buildStudyStages, flattenProblemCollection } from '@/lib/problems/problem-data';

describe('array study guide', () => {
  const stages = buildStudyStages(arrayProblemData as unknown[]);
  const problems = flattenProblemCollection(arrayProblemData as unknown[]);

  it('loads stages from json in the expected order', () => {
    expect(stages.map((stage) => stage.id)).toEqual([
      'warmup',
      'scan',
      'prefix-matrix',
      'advanced',
    ]);
  });

  it('assigns every array problem to exactly one stage', () => {
    const stagedProblemIds = stages.flatMap((stage) => stage.problems).map((problem) => problem.id);

    expect(new Set(stagedProblemIds).size).toBe(problems.length);
    expect(stagedProblemIds).toHaveLength(problems.length);
    expect(stagedProblemIds.sort()).toEqual(problems.map((problem) => problem.id).sort());
  });

  it('groups problems by stage while preserving stage order', () => {
    expect(stages.map((stage) => stage.id)).toEqual([
      'warmup',
      'scan',
      'prefix-matrix',
      'advanced',
    ]);
    expect(stages.flatMap((stage) => stage.problems).map((problem) => problem.id)).toHaveLength(
      problems.length
    );
  });
});
