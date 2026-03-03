import type { BaseFrame } from '@/types/algorithm';

export enum AlgorithmMode {
  HASH_SET = 'HASH_SET',
  DP_HASH_MAP = 'DP_HASH_MAP',
  SORTING = 'SORTING',
}

export interface LongestConsecutiveFrame extends BaseFrame {
  mode: AlgorithmMode;
  nums: number[];

  // Hash Set 相关
  numSet?: Set<number>;

  // DP Hash Map 相关
  dpMap?: Map<number, number>;
  leftLength?: number;
  rightLength?: number;

  // Sorting 相关
  sortedNums?: number[];
  currentIndex?: number;

  // 公共状态
  currentNum: number | null;
  currentStreak: number;
  longestStreak: number;
  streakNums: number[]; // 当前高亮序列

  phase: 'init' | 'build' | 'sort' | 'search' | 'update_dp' | 'done';
}

export interface LongestConsecutiveInput {
  nums: number[];
}
