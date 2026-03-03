import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { twoSumConfig } from '@/lib/problems/array/two-sum/index';
import { AlgorithmMode, ElementState, type TwoSumFrame } from '@/lib/problems/array/two-sum/types';

describe('twoSumConfig', () => {
  it('parses and formats input correctly', () => {
    const inputText = 'nums=[2,7,11,15], target=9';
    const parsed = twoSumConfig.parseInput(inputText);

    expect(parsed).toEqual({ nums: [2, 7, 11, 15], target: 9 });
    expect(twoSumConfig.formatInput({ nums: [2, 7, 11, 15], target: 9 })).toBe(inputText);
    expect(twoSumConfig.parseInput('bad-input')).toBeNull();
  });

  it('generates random input containing at least one valid pair', () => {
    for (let n = 0; n < 10; n += 1) {
      const randomInput = twoSumConfig.generateRandomInput();
      expect(randomInput.nums.length).toBeGreaterThanOrEqual(4);
      expect(randomInput.nums.length).toBeLessThanOrEqual(10);

      let found = false;
      for (let i = 0; i < randomInput.nums.length; i += 1) {
        for (let j = i + 1; j < randomInput.nums.length; j += 1) {
          if (randomInput.nums[i] + randomInput.nums[j] === randomInput.target) {
            found = true;
            break;
          }
        }
        if (found) break;
      }

      expect(found).toBe(true);
    }
  });

  it('generates frames for all modes and falls back on unknown mode', () => {
    const input = { nums: [2, 7, 11, 15], target: 9 };

    const brute = twoSumConfig.generateFrames(input, AlgorithmMode.BRUTE_FORCE);
    const hashMap = twoSumConfig.generateFrames(input, AlgorithmMode.HASH_MAP);
    const twoPointer = twoSumConfig.generateFrames(input, AlgorithmMode.TWO_POINTER);
    const fallback = twoSumConfig.generateFrames(input, 'UNKNOWN_MODE');

    expect(brute.at(-1)?.line).toBe(8);
    expect(hashMap.at(-1)?.line).toBe(7);
    expect(twoPointer.at(-1)?.line).toBe(10);
    expect(fallback[0]?.line).toBe(brute[0]?.line);
  });

  it('renders visualizer content for map and sorted-pointer sections', () => {
    const frame: TwoSumFrame = {
      line: 6,
      message: 'frame',
      nums: [2, 7, 11, 15, 3, 6],
      target: 9,
      states: [
        ElementState.ACTIVE,
        ElementState.MATCH,
        ElementState.VISITED,
        ElementState.LEFT_POINTER,
        ElementState.RIGHT_POINTER,
        ElementState.NORMAL,
      ],
      i: 0,
      j: 1,
      left: 0,
      right: 4,
      map: { 2: 0, 7: 1 },
      complement: 2,
      currentSum: 9,
      sortedPairs: [
        { val: 2, idx: 0 },
        { val: 3, idx: 4 },
        { val: 6, idx: 5 },
        { val: 7, idx: 1 },
        { val: 11, idx: 2 },
        { val: 15, idx: 3 },
      ],
    };

    render(
      <>
        {twoSumConfig.RendererVisualizer({
          currentFrame: frame,
          currentStep: 0,
          isPlaying: false,
        })}
      </>
    );

    expect(screen.getByText('Target:')).toBeInTheDocument();
    expect(screen.getByText('Looking for:')).toBeInTheDocument();
    expect(screen.getByText('Current Sum:')).toBeInTheDocument();
    expect(screen.getByText('Hash Map Table')).toBeInTheDocument();
    expect(screen.getByText('Left')).toBeInTheDocument();
    expect(screen.getByText('Right')).toBeInTheDocument();
  });
});
