import type { BaseFrame } from '@/types/algorithm';

export enum AlgorithmMode {
  CLASSIC = 'CLASSIC',
  FAST_SKIP = 'FAST_SKIP',
  SORT_INDEX = 'SORT_INDEX',
}

export interface ContainerFrame extends BaseFrame {
  mode: AlgorithmMode;
  height: number[];
  left: number;
  right: number;
  maxArea: number;

  // 用于渲染额外的信息
  currentArea?: number;

  // 排序+索引专属状态
  sortedHeights?: Array<{ height: number; originalIdx: number }>;
  currentProcessedIdx?: number;
  minIdx?: number;
  maxIdx?: number;
}

export interface ContainerInput {
  height: number[];
}
