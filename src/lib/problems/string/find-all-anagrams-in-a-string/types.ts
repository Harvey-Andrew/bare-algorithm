import type { BaseFrame } from '@/types/algorithm';

export enum AlgorithmMode {
  SLIDING_WINDOW = 'SLIDING_WINDOW',
  DIFF_OPTIMIZED = 'DIFF_OPTIMIZED',
}

export type FindAnagramsPhase = 'init' | 'expanding' | 'sliding' | 'match' | 'completed';

export interface FindAnagramsFrame extends BaseFrame {
  mode: AlgorithmMode;
  s: string;
  p: string;
  left: number;
  right: number;
  result: number[];
  phase?: FindAnagramsPhase;

  /** p 的字符频率 */
  pCount: Record<string, number>;
  /** 当前窗口的字符频率 */
  sCount: Record<string, number>;

  /** diff 优化模式：不一致的字符数 */
  diff?: number;

  /** 当前窗口超出的字符（被移除） */
  removedChar?: string;
  /** 当前窗口新加的字符 */
  addedChar?: string;
}

export interface FindAnagramsInput {
  s: string;
  p: string;
}
