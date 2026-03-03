import type { DataItem } from './types';

export function generateMockData(count: number): DataItem[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `item-${i}`,
    value: Math.random() * 1000,
    processed: false,
  }));
}

export const CONFIG = {
  DEFAULT_DATA_COUNT: 100000,
  DEFAULT_CHUNK_SIZE: 1000,
  CHUNK_SIZES: [100, 500, 1000, 2000, 5000],
  PROCESS_DELAY_MS: 0,
};
