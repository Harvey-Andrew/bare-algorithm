import type { BaseFrame } from '@/types/algorithm';

export enum AlgorithmMode {
  SLIDING_WINDOW = 'SLIDING_WINDOW',
  SLIDING_WINDOW_MAP = 'SLIDING_WINDOW_MAP',
}

export type LongestSubstringPhase = 'init' | 'expanding' | 'shrinking' | 'found-max' | 'completed';

export interface LongestSubstringFrame extends BaseFrame {
  mode: AlgorithmMode;
  s: string;
  left: number;
  right: number;
  maxLen: number;
  bestLeft: number;
  bestRight: number;
  phase?: LongestSubstringPhase;

  // Set 模式
  windowChars?: string[];

  // Map 模式
  charMap?: Record<string, number>;
  jumpFrom?: number;

  // 当前碰撞的重复字符
  conflictChar?: string;
}

export interface LongestSubstringInput {
  s: string;
}
