import { AlgorithmMode, SubarraySumInput } from './types';

export const MODES = [
  {
    value: AlgorithmMode.PREFIX_SUM_HASH,
    label: '前缀和 + 哈希表',
  },
  {
    value: AlgorithmMode.DIVIDE_CONQUER,
    label: '分治法',
  },
  {
    value: AlgorithmMode.TYPED_ARRAY,
    label: '桶优化',
  },
];

export const PREFIX_SUM_HASH_CODE = [
  'function subarraySum(nums, k) {',
  '  let count = 0;',
  '  let pre = 0;',
  '  const map = new Map();',
  '  map.set(0, 1);',
  '  ',
  '  for (let i = 0; i < nums.length; i++) {',
  '    pre += nums[i];',
  '    if (map.has(pre - k)) {',
  '      count += map.get(pre - k);',
  '    }',
  '    map.set(pre, (map.get(pre) || 0) + 1);',
  '  }',
  '  return count;',
  '}',
];

export const DIVIDE_CONQUER_CODE = [
  'function subarraySum(nums, k) {',
  '  const countCrossing = (start, mid, end) => {',
  '    let count = 0;',
  '    const leftMap = new Map();',
  '    let leftSum = 0;',
  '    for (let i = mid; i >= start; i--) {',
  '      leftSum += nums[i];',
  '      leftMap.set(leftSum, (leftMap.get(leftSum)||0)+1);',
  '    }',
  '    let rightSum = 0;',
  '    for (let i = mid+1; i <= end; i++) {',
  '      rightSum += nums[i];',
  '      if (leftMap.has(k - rightSum)) {',
  '        count += leftMap.get(k - rightSum);',
  '      }',
  '    }',
  '    return count;',
  '  };',
  '  const solve = (start, end) => {',
  '    if (start === end) return nums[start]===k ? 1 : 0;',
  '    const mid = (start + end) >> 1;',
  '    return solve(start, mid)',
  '         + solve(mid+1, end)',
  '         + countCrossing(start, mid, end);',
  '  };',
  '  return nums.length ? solve(0, nums.length-1) : 0;',
  '}',
];

export const TYPED_ARRAY_CODE = [
  'function subarraySum(nums, k) {',
  '  const OFFSET = 20000000;',
  '  const SIZE = 40000005;',
  '  const map = new Int32Array(SIZE);',
  '  map[OFFSET] = 1; // 初始化 {0: 1}',
  '',
  '  let count = 0, preSum = 0;',
  '  for (let i = 0; i < nums.length; i++) {',
  '    preSum += nums[i];',
  '    const target = preSum - k + OFFSET;',
  '    if (target >= 0 && target < SIZE) {',
  '      count += map[target];',
  '    }',
  '    map[preSum + OFFSET]++;',
  '  }',
  '  return count;',
  '}',
];

export const LEGEND_ITEMS = [
  { colorBg: 'bg-slate-600', label: '未访问' },
  { colorBg: 'bg-blue-500', label: '当前元素' },
  { colorBg: 'bg-emerald-500', label: '找到匹配' },
];

export const DEFAULT_INPUT: SubarraySumInput = {
  nums: [1, 1, 1],
  k: 2,
};
