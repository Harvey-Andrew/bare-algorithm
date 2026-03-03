import type { FilterDimension } from './types';

export const DEFAULT_DIMENSIONS: FilterDimension[] = [
  { name: '颜色', options: ['红色', '蓝色', '黑色'] },
  { name: '尺寸', options: ['S', 'M', 'L', 'XL'] },
  { name: '材质', options: ['棉', '涤纶'] },
];

export const MAX_COMBINATIONS = 500;
