import type { LayoutWidget } from './types';

export const GRID_SIZE = 4;

export const DEFAULT_WIDGETS: LayoutWidget[] = [
  { id: 'w1', name: '图表', width: 2, height: 2 },
  { id: 'w2', name: '表格', width: 2, height: 1 },
  { id: 'w3', name: '统计', width: 1, height: 1 },
];
