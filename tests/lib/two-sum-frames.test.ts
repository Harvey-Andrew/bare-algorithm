import { describe, expect, it } from 'vitest';

import {
  generateBruteForceFrames,
  generateHashMapFrames,
  generateTwoPointerFrames,
} from '@/lib/problems/array/two-sum/frames';
import { ElementState, type TwoSumInput } from '@/lib/problems/array/two-sum/types';

const solvableInput: TwoSumInput = {
  nums: [2, 7, 11, 15],
  target: 9,
};

describe('two-sum frame generators', () => {
  it('generates brute-force frames that end at the matching pair', () => {
    const frames = generateBruteForceFrames(solvableInput);
    const last = frames.at(-1);

    expect(frames.length).toBeGreaterThanOrEqual(5);
    expect(last?.line).toBe(8);
    expect(last?.i).toBe(0);
    expect(last?.j).toBe(1);
    expect(last?.states[0]).toBe(ElementState.MATCH);
    expect(last?.states[1]).toBe(ElementState.MATCH);
  });

  it('generates hash-map frames with map population before match', () => {
    const frames = generateHashMapFrames(solvableInput);
    const hasStoredFirstValue = frames.some((frame) => frame.map && frame.map[2] === 0);
    const last = frames.at(-1);

    expect(hasStoredFirstValue).toBe(true);
    expect(last?.line).toBe(7);
    expect(last?.complement).toBe(2);
    expect(last?.states[0]).toBe(ElementState.MATCH);
    expect(last?.states[1]).toBe(ElementState.MATCH);
  });

  it('generates two-pointer frames that move pointers before finding match', () => {
    const frames = generateTwoPointerFrames(solvableInput);
    const movedRightPointer = frames.some((frame) => frame.right === 2);
    const last = frames.at(-1);

    expect(frames.length).toBeGreaterThan(10);
    expect(movedRightPointer).toBe(true);
    expect(last?.line).toBe(10);
    expect(last?.states[0]).toBe(ElementState.MATCH);
    expect(last?.states[1]).toBe(ElementState.MATCH);
    expect(Array.isArray(last?.sortedPairs)).toBe(true);
  });

  it('covers no-solution paths for all three strategies', () => {
    const noSolutionInput: TwoSumInput = {
      nums: [1, 2, 3],
      target: 100,
    };

    const bruteFrames = generateBruteForceFrames(noSolutionInput);
    const hashFrames = generateHashMapFrames(noSolutionInput);
    const twoPointerFrames = generateTwoPointerFrames(noSolutionInput);

    expect(bruteFrames.at(-1)?.line).toBe(12);
    expect(hashFrames.at(-1)?.line).toBe(13);
    expect(twoPointerFrames.at(-1)?.line).toBe(18);
  });
});
