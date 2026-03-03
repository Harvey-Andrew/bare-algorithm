import { describe, expect, it } from 'vitest';

import {
  CATEGORY_PROBLEM_EXPORTS,
  loadProblemConfig,
} from '@/lib/problems/problem-loaders.generated';

describe('problem-loaders.generated', () => {
  it('contains stable export mapping for array/two-sum', () => {
    expect(CATEGORY_PROBLEM_EXPORTS.array['two-sum']).toBe('twoSumConfig');
  });

  it('returns null for unknown category or problem', async () => {
    await expect(loadProblemConfig('unknown-category', 'x')).resolves.toBeNull();
    await expect(loadProblemConfig('array', 'unknown-problem')).resolves.toBeNull();
  });

  it('loads known problem config lazily', async () => {
    const config = await loadProblemConfig('array', 'two-sum');
    expect(config).not.toBeNull();
    expect(config?.id).toBe('two-sum');
    expect(typeof config?.generateFrames).toBe('function');
  }, 15000);
});
