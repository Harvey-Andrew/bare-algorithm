import { BaseFrame } from '@/types/algorithm';

export enum AlgorithmMode {
  BRUTE_FORCE = 'BRUTE_FORCE',
  HASH_MAP = 'HASH_MAP',
  TWO_POINTER = 'TWO_POINTER',
}

export enum ElementState {
  NORMAL = 'NORMAL',
  ACTIVE = 'ACTIVE', // Currently accessing i or j
  COMPLEMENT = 'COMPLEMENT', // The expected complement value
  MATCH = 'MATCH', // Found pair
  VISITED = 'VISITED', // In hash map
  LEFT_POINTER = 'LEFT_POINTER', // Left pointer for two pointer method
  RIGHT_POINTER = 'RIGHT_POINTER', // Right pointer for two pointer method
}

export interface TwoSumFrame extends BaseFrame {
  nums: number[];
  target: number;

  // Pointers
  i?: number;
  j?: number;

  // Two Pointer specific: left and right pointers
  left?: number;
  right?: number;

  // Sorted array with original indices for two pointer visualization
  sortedPairs?: { val: number; idx: number }[];

  // Hash map visualization
  map?: Record<number, number>; // value -> index. Using Record for JSON compatibility

  // Current step details
  currentVal?: number;
  complement?: number;
  currentSum?: number; // For two pointer: nums[left] + nums[right]

  // Visual states for array elements
  states: ElementState[];
}

export interface TwoSumInput {
  nums: number[];
  target: number;
}
