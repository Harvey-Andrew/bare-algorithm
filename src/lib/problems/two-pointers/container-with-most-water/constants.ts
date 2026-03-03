import { AlgorithmMode, ContainerInput } from './types';

export const MODES = [
  {
    value: AlgorithmMode.BRUTE_FORCE,
    label: '暴力枚举',
  },
  {
    value: AlgorithmMode.TP,
    label: '双指针',
  },
];

export const BF_CODE = [
  'function maxAreaBruteForce(height) {',
  '  let maxArea = 0;',
  '  for (let i = 0; i < height.length - 1; i++) {',
  '    for (let j = i + 1; j < height.length; j++) {',
  '      const area = Math.min(height[i], height[j]) * (j - i);',
  '      if (area > maxArea) {',
  '        maxArea = area;',
  '      }',
  '    }',
  '  }',
  '  return maxArea;',
  '}',
];

export const TP_CODE = [
  'function maxArea(height) {',
  '  let left = 0;',
  '  let right = height.length - 1;',
  '  let maxArea = 0;',
  '  ',
  '  while (left < right) {',
  '    const area = (right - left) * Math.min(height[left], height[right]);',
  '    if (area > maxArea) {',
  '      maxArea = area;',
  '    }',
  '    ',
  '    if (height[left] < height[right]) {',
  '      left++;',
  '    } else {',
  '      right--;',
  '    }',
  '  }',
  '  return maxArea;',
  '}',
];

export const BF_LEGEND = [
  { colorBg: 'bg-rose-500', label: 'i (锚定值)' },
  { colorBg: 'bg-purple-500', label: 'j (正在扫描)' },
];

export const TP_LEGEND = [
  { colorBg: 'bg-cyan-500', label: 'Left' },
  { colorBg: 'bg-purple-500', label: 'Right' },
];

export const DEFAULT_INPUT: ContainerInput = { height: [1, 8, 6, 2, 5, 4, 8, 3, 7] };
