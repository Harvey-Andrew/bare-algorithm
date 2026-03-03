import { AlgorithmMode, LongestConsecutiveInput } from './types';

export const MODES = [
  {
    value: AlgorithmMode.HASH_SET,
    label: '哈希集合 (标准最优 O(N))',
  },
  {
    value: AlgorithmMode.DP_HASH_MAP,
    label: '动态规划哈希拼凑法',
  },
  {
    value: AlgorithmMode.SORTING,
    label: '原地排序迭代',
  },
];

export const HASH_SET_CODE = [
  'function longestConsecutive(nums) {',
  '  if (nums.length === 0) return 0;',
  '  const numSet = new Set(nums);',
  '  let maxLength = 0;',
  '  ',
  '  for (const num of numSet) {',
  '    // 只有当 num 是一个序列的"起点"时，才开始向后匹配',
  '    if (!numSet.has(num - 1)) {',
  '      let currentNum = num;',
  '      let currentLength = 1;',
  '      ',
  '      while (numSet.has(currentNum + 1)) {',
  '        currentNum += 1;',
  '        currentLength += 1;',
  '      }',
  '      ',
  '      if (currentLength > maxLength) {',
  '        maxLength = currentLength;',
  '      }',
  '    }',
  '  }',
  '  return maxLength;',
  '}',
];

export const DP_HASH_MAP_CODE = [
  'function longestConsecutive(nums) {',
  '  if (nums.length === 0) return 0;',
  '  const dp = new Map();',
  '  let maxLength = 0;',
  '  ',
  '  for (const num of nums) {',
  '    if (dp.has(num)) continue;',
  '    ',
  '    const left = dp.get(num - 1) ?? 0;',
  '    const right = dp.get(num + 1) ?? 0;',
  '    const currentLength = left + right + 1;',
  '    ',
  '    if (currentLength > maxLength) {',
  '      maxLength = currentLength;',
  '    }',
  '    ',
  '    dp.set(num, currentLength);',
  '    dp.set(num - left, currentLength);',
  '    dp.set(num + right, currentLength);',
  '  }',
  '  ',
  '  return maxLength;',
  '}',
];

export const SORTING_CODE = [
  'function longestConsecutive(nums) {',
  '  if (nums.length === 0) return 0;',
  '  nums.sort((a, b) => a - b);',
  '  ',
  '  let maxLength = 1;',
  '  let currentLength = 1;',
  '  ',
  '  for (let i = 1; i < nums.length; i++) {',
  '    if (nums[i] === nums[i - 1]) continue;',
  '    ',
  '    if (nums[i] === nums[i - 1] + 1) {',
  '      currentLength++;',
  '    } else {',
  '      if (currentLength > maxLength) {',
  '        maxLength = currentLength;',
  '      }',
  '      currentLength = 1;',
  '    }',
  '  }',
  '  ',
  '  return Math.max(maxLength, currentLength);',
  '}',
];

export const LEGEND_ITEMS = [
  { colorBg: 'bg-emerald-500', label: '最长连续序列 / 更新区间端点' },
  { colorBg: 'bg-teal-500', label: '哈希集合遍历点 / 当前活跃点' },
  { colorBg: 'bg-indigo-500', label: '遍历当前元素' },
  { colorBg: 'bg-slate-700', label: '未处理元素' },
];

export const DEFAULT_INPUT: LongestConsecutiveInput = {
  nums: [100, 4, 200, 1, 3, 2],
};
