import type { BaseFrame } from '@/types/algorithm';

export enum AlgorithmMode {
  TP = 'TP',
  HASH = 'HASH',
  OPTIMIZED = 'OPTIMIZED',
}

export type ThreeSumPhase = 'searching' | 'found' | 'skip-duplicate' | 'completed';

export interface ThreeSumFrame extends BaseFrame {
  mode: AlgorithmMode;
  nums: number[];
  i?: number;

  // 对于双指针和 HASH 模式的指针
  left?: number;
  right?: number;
  j?: number;
  k?: number;

  result: number[][];

  // UI 高级呈现：当前计算的和，目前执行的特殊动画阶段
  currentSum?: number;
  phase?: ThreeSumPhase;

  // HASH 模式特有的展示状态
  target?: number;
  seen?: number[];

  // OPTIMIZED 分桶模式特有的状态
  counter?: Record<string, number>;
  pos?: number[];
  neg?: number[];
  checkingCase?: string;
  activeBuckets?: number[];
}

export interface ThreeSumInput {
  nums: number[];
}
