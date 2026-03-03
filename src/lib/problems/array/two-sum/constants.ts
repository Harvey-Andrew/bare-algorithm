import { AlgorithmMode, TwoSumInput } from './types';

// 模式定义
export const MODES = [
  {
    value: AlgorithmMode.BRUTE_FORCE,
    label: '暴力枚举',
  },
  {
    value: AlgorithmMode.HASH_MAP,
    label: '哈希表',
  },
  {
    value: AlgorithmMode.TWO_POINTER,
    label: '排序+双指针',
  },
];

// 暴力法代码
export const BRUTE_FORCE_CODE = [
  'function twoSum(nums, target) {',
  '  // 遍历第一个数',
  '  for (let i = 0; i < nums.length; i++) {',
  '    // 遍历第二个数',
  '    for (let j = i + 1; j < nums.length; j++) {',
  '      // 检查和是否为 target',
  '      if (nums[i] + nums[j] === target) {',
  '        return [i, j];',
  '      }',
  '    }',
  '  }',
  '  return [];',
  '}',
];

// 哈希表法代码
export const HASH_MAP_CODE = [
  'function twoSum(nums, target) {',
  '  const map = new Map();',
  '  for (let i = 0; i < nums.length; i++) {',
  '    const complement = target - nums[i];',
  '    // 检查 map 中是否存在补数',
  '    if (map.has(complement)) {',
  '      return [map.get(complement), i];',
  '    }',
  '    // 将当前值存入 map',
  '    map.set(nums[i], i);',
  '  }',
  '  return [];',
  '}',
];

// 双指针法代码
export const TWO_POINTER_CODE = [
  'function twoSum(nums, target) {',
  '  // 创建带原始下标的数组并排序',
  '  const pairs = nums.map((val, idx) => ({ val, idx }));',
  '  pairs.sort((a, b) => a.val - b.val);',
  '  // 初始化双指针',
  '  let left = 0, right = pairs.length - 1;',
  '  while (left < right) {',
  '    const sum = pairs[left].val + pairs[right].val;',
  '    if (sum === target) {',
  '      return [pairs[left].idx, pairs[right].idx];',
  '    } else if (sum < target) {',
  '      left++;  // 和太小，左指针右移',
  '    } else {',
  '      right--; // 和太大，右指针左移',
  '    }',
  '  }',
  '  return [];',
  '}',
];

// 图例
export const LEGEND_ITEMS = [
  { colorBg: 'bg-slate-600', label: '未访问' },
  { colorBg: 'bg-blue-500', label: '当前检查 (i/j)' },
  { colorBg: 'bg-indigo-500', label: '目标补数' },
  { colorBg: 'bg-emerald-500', label: '已匹配' },
  { colorBg: 'bg-amber-600', label: '已存入哈希表' },
  { colorBg: 'bg-cyan-500', label: '左指针' },
  { colorBg: 'bg-rose-500', label: '右指针' },
];

// 默认输入
export const DEFAULT_INPUT: TwoSumInput = {
  nums: [2, 7, 11, 15],
  target: 9,
};
