import type { DataItem } from './types';

export const DATA_SIZE = 1000;

export function generateSortedData(size: number): DataItem[] {
  return Array.from({ length: size }, (_, i) => ({
    id: i,
    name: `Item-${String(i).padStart(4, '0')}`,
    value: i * 10 + Math.floor(Math.random() * 5),
  })).sort((a, b) => a.value - b.value);
}
