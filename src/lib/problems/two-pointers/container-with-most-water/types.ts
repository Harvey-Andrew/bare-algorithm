import type { BaseFrame } from '@/types/algorithm';

export enum AlgorithmMode {
  TP = 'TP',
  BRUTE_FORCE = 'BRUTE_FORCE',
}

export interface ContainerFrame extends BaseFrame {
  mode: AlgorithmMode;
  height: number[];
  left: number;
  right: number;
  maxArea: number;

  // 用于渲染额外的信息
  currentArea?: number;
}

export interface ContainerInput {
  height: number[];
}
