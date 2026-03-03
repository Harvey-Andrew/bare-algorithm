import { BaseFrame } from '@/types/algorithm';

export enum AlgorithmMode {
  PREFIX_SUM_HASH = 'PREFIX_SUM_HASH',
  DIVIDE_CONQUER = 'DIVIDE_CONQUER',
  TYPED_ARRAY = 'TYPED_ARRAY',
}

export enum ElementState {
  NORMAL = 'NORMAL',
  CURRENT = 'CURRENT',
  MATCH = 'MATCH',
  ACTIVE = 'ACTIVE',
}

export interface SubarraySumFrame extends BaseFrame {
  nums: number[];
  k?: number;
  count: number;
  highlightIndices: number[];
  map?: Record<number, number>; // For prefix sum
  states: ElementState[];
  // 前缀和可视化专用字段
  currentIndex?: number;
  prefixSum?: number;
  targetPrefix?: number;
  // TypedArray 可视化专用字段
  arraySlice?: { start: number; end: number; values: number[] }; // 展示 TypedArray 的局部切片
  offset?: number; // 偏移量
  // 分治法可视化专用字段
  leftRange?: [number, number]; // 左半边区间 [start, mid]
  rightRange?: [number, number]; // 右半边区间 [mid+1, end]
  crossingRange?: [number, number]; // 跨越区间
  recursionDepth?: number; // 递归深度
  phase?: 'left' | 'right' | 'crossing' | 'merge'; // 当前阶段
  leftSumMap?: Record<number, number>; // 左半边后缀和 Map
  rightSum?: number; // 当前右半边前缀和
}

export interface SubarraySumInput {
  nums: number[];
  k: number;
}
