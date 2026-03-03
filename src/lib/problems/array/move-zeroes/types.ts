import { BaseFrame } from '@/types/algorithm';

export enum AlgorithmMode {
  OVERWRITE_FILL = 'OVERWRITE_FILL',
  TWO_POINTERS = 'TWO_POINTERS',
  SORT_METHOD = 'SORT_METHOD',
}

export enum ElementState {
  NORMAL = 'NORMAL',
  FAST_PTR = 'FAST_PTR',
  SLOW_PTR = 'SLOW_PTR',
  SWAP = 'SWAP',
  ZERO = 'ZERO',
  DONE = 'DONE',
}

export interface MoveZeroesFrame extends BaseFrame {
  nums: number[];
  fast?: number;
  slow?: number;
  states: ElementState[];
}

export interface MoveZeroesInput {
  nums: number[];
}
