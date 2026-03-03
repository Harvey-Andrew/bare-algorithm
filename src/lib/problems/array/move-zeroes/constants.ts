import { AlgorithmMode, MoveZeroesInput } from './types';

export const MODES = [
  {
    value: AlgorithmMode.OVERWRITE_FILL,
    label: '覆盖填充法',
  },
  {
    value: AlgorithmMode.TWO_POINTERS,
    label: '双指针交换',
  },
  {
    value: AlgorithmMode.SORT_METHOD,
    label: '排序法',
  },
];

// 解法1：覆盖填充法（两次遍历）- 最稳健
export const OVERWRITE_FILL_CODE = [
  'function moveZeroes(nums) {',
  '  let insertPos = 0;',
  '  const n = nums.length;',
  '  // 第一步：将所有非零元素按顺序移到前端',
  '  for (let i = 0; i < n; i++) {',
  '    if (nums[i] !== 0) {',
  '      nums[insertPos] = nums[i];',
  '      insertPos++;',
  '    }',
  '  }',
  '  // 第二步：将剩余位置全部填充为 0',
  '  for (let i = insertPos; i < n; i++) {',
  '    nums[i] = 0;',
  '  }',
  '}',
];

// 解法2：双指针交换法（一次遍历）- 减少操作次数
export const TWO_POINTERS_CODE = [
  'function moveZeroes(nums) {',
  '  let slow = 0;',
  '  for (let fast = 0; fast < nums.length; fast++) {',
  '    if (nums[fast] !== 0) {',
  '      if (fast !== slow) {',
  '        [nums[slow], nums[fast]] = [nums[fast], nums[slow]];',
  '      }',
  '      slow++;',
  '    }',
  '  }',
  '}',
];

// 解法3：排序法（O(N log N)，不推荐但需了解）
export const SORT_METHOD_CODE = [
  'function moveZeroes(nums) {',
  '  nums.sort((a, b) => {',
  '    // 如果 b 是 0，a 不是 0，则 a 排前面',
  '    if (b === 0 && a !== 0) return -1;',
  '    // 如果 a 是 0，b 不是 0，则 a 排后面',
  '    if (a === 0 && b !== 0) return 1;',
  '    // 都是 0 或都不是 0，保持相对位置',
  '    return 0;',
  '  });',
  '}',
];

export const LEGEND_ITEMS = [
  { colorBg: 'bg-slate-600', label: '未处理' },
  { colorBg: 'bg-blue-500', label: '扫描指针' },
  { colorBg: 'bg-amber-500', label: '写入指针' },
  { colorBg: 'bg-emerald-500', label: '已完成' },
  { colorBg: 'bg-yellow-500', label: '比较/交换中' },
];

export const DEFAULT_INPUT: MoveZeroesInput = {
  nums: [0, 1, 0, 3, 12],
};
