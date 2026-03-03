import path from 'path';
import { describe, expect, it } from 'vitest';

import {
  getAllProblemRouteParams,
  getProblemJsonPath,
  getSolutionContentPaths,
  isKnownProblemRoute,
} from '@/lib/problems/problem-server';

describe('problem-server helpers', () => {
  it('accepts only known safe problem routes', () => {
    expect(isKnownProblemRoute('array', 'two-sum')).toBe(true);
    expect(isKnownProblemRoute('../array', 'two-sum')).toBe(false);
    expect(isKnownProblemRoute('array', '..\\two-sum')).toBe(false);
    expect(isKnownProblemRoute('array', 'missing-problem')).toBe(false);
  });

  it('resolves problem files only inside the problems root', () => {
    expect(getProblemJsonPath('array')).toBe(
      path.join(process.cwd(), 'src', 'lib', 'problems', 'array', 'problem.json')
    );
    expect(getProblemJsonPath('../array')).toBeNull();

    expect(getSolutionContentPaths('array', 'two-sum')).toEqual([
      path.join(process.cwd(), 'src', 'lib', 'problems', 'array', 'two-sum.md'),
      path.join(process.cwd(), 'src', 'lib', 'problems', 'array', 'two-sum', 'solution.md'),
    ]);
    expect(getSolutionContentPaths('array', '../two-sum')).toEqual([]);
  });

  it('exposes static params for known routes only', () => {
    const params = getAllProblemRouteParams();
    expect(params).toContainEqual({ category: 'array', problem: 'two-sum' });
    expect(
      params.some(({ category, problem }) => category.includes('..') || problem.includes('..'))
    ).toBe(false);
  });
});
