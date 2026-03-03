import type { BaseFrame } from '@/types/algorithm';

export enum AlgorithmMode {
  SORTING = 'SORTING',
  COUNT_HASH = 'COUNT_HASH',
  PRIME_MULTIPLICATION = 'PRIME_MULTIPLICATION',
}

export interface GroupAnagramsFrame extends BaseFrame {
  // Global context
  strs: string[];
  currentIndex: number;
  currentStr: string;
  calculatedKey: string | bigint | null;

  // The state of the map during processing
  // string key for Sorting and Count Hash, stringified bigint for Prime Multiplication
  mapState: Array<{ key: string; group: string[] }>;

  // Internal calculations visibility depending on mode
  // For SORTING mode: show the sorting process strings
  sortingProcess?: { original: string; arrayForm: string[]; sortedForm: string[] };

  // For COUNT_HASH mode: show the char count array
  countArray?: number[]; // always length 26
  countIndexHighlight?: number; // the char index being counted right now

  // For PRIME_MULTIPLICATION mode: show prime factors
  primeAccumulation?: { currentFactor: bigint; currentAccumulation: bigint };
}

export interface GroupAnagramsInput {
  strs: string[];
}
