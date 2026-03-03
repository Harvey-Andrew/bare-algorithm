import { AlgorithmMode, ThreeSumInput } from './types';

export const MODES = [
  {
    value: AlgorithmMode.TP,
    label: '排序 + 双指针',
  },
  {
    value: AlgorithmMode.HASH,
    label: '哈希集合',
  },
  {
    value: AlgorithmMode.OPTIMIZED,
    label: '计数 + 桶统计',
  },
];

export const TP_CODE = [
  'function threeSum(nums) {',
  '  nums.sort((a, b) => a - b);',
  '  const result = [];',
  '  for (let i = 0; i < nums.length - 2; i++) {',
  '    if (nums[i] > 0) break; // 剪枝',
  '    if (i > 0 && nums[i] === nums[i-1]) continue; // 去重 1',
  '    let left = i + 1, right = nums.length - 1;',
  '    while (left < right) {',
  '      const sum = nums[i] + nums[left] + nums[right];',
  '      if (sum === 0) {',
  '         result.push([nums[i], nums[left], nums[right]]);',
  '         while(left < right && nums[left] === nums[left+1]) left++; // 去重 2',
  '         while(left < right && nums[right] === nums[right-1]) right--; // 去重 3',
  '         left++; right--;',
  '      }',
  '      else if (sum < 0) left++;',
  '      else right--;',
  '    }',
  '  }',
  '  return result;',
  '}',
];

export const HASH_CODE = [
  'function threeSumHash(nums) {',
  '  const resSet = new Set();',
  '  const n = nums.length;',
  '  nums.sort((a, b) => a - b);',
  '  for (let i = 0; i < n - 2; i++) {',
  '    if (nums[i] > 0) break;',
  '    if (i > 0 && nums[i] === nums[i - 1]) continue;',
  '    const target = -nums[i];',
  '    const seen = new Set();',
  '    for (let j = i + 1; j < n; j++) {',
  '      const complement = target - nums[j];',
  '      if (seen.has(complement)) {',
  '        resSet.add(`${nums[i]},${complement},${nums[j]}`);',
  '      }',
  '      seen.add(nums[j]);',
  '    }',
  '  }',
  '  return Array.from(resSet).map((str) => str.split(",").map(Number));',
  '}',
];

export const OPTIMIZED_CODE = [
  'function threeSumOptimized(nums) {',
  '  const res = [];',
  '  const counter = new Map();',
  '  for (const x of nums) counter.set(x, (counter.get(x) || 0) + 1);',
  '  const uniqueNums = Array.from(counter.keys()).sort((a, b) => a - b);',
  '  const pos = uniqueNums.filter((x) => x > 0);',
  '  const neg = uniqueNums.filter((x) => x < 0);',
  '',
  '  if ((counter.get(0) || 0) >= 3) res.push([0, 0, 0]); // Case 1',
  '  if ((counter.get(0) || 0) > 0) {',
  '    for (const p of pos) if (counter.has(-p)) res.push([-p, 0, p]); // Case 2',
  '  }',
  '  for (let i = 0; i < neg.length; i++) { // Case 3: 2 负 1 正',
  '    for (let j = i; j < neg.length; j++) {',
  '      if (i === j && counter.get(neg[i]) < 2) continue;',
  '      const target = -(neg[i] + neg[j]);',
  '      if (counter.has(target)) res.push([neg[i], neg[j], target]);',
  '    }',
  '  }',
  '  for (let i = 0; i < pos.length; i++) { // Case 4: 2 正 1 负',
  '    for (let j = i; j < pos.length; j++) {',
  '      if (i === j && counter.get(pos[i]) < 2) continue;',
  '      const target = -(pos[i] + pos[j]);',
  '      if (counter.has(target)) res.push([target, pos[i], pos[j]]);',
  '    }',
  '  }',
  '  return res;',
  '}',
];

export const TP_LEGEND = [
  { colorBg: 'bg-amber-500', label: 'i (锚点)' },
  { colorBg: 'bg-cyan-500', label: 'Left' },
  { colorBg: 'bg-purple-500', label: 'Right' },
  {
    colorBg: 'bg-slate-500/50 border border-slate-500 border-dashed text-slate-300',
    label: 'Skip (被跳过与剪枝)',
  },
];

export const HASH_LEGEND = [
  { colorBg: 'bg-amber-500 text-slate-950', label: 'i (锚点)' },
  { colorBg: 'bg-rose-500 text-white', label: 'j (探索者)' },
  { colorBg: 'bg-indigo-500 border-dashed border-2', label: 'Complement (已出现的补数)' },
];

export const OPTIMIZED_LEGEND = [
  { colorBg: 'bg-amber-600 text-white', label: 'Zero (零)' },
  { colorBg: 'bg-rose-600 text-white', label: 'Neg (负数桶)' },
  { colorBg: 'bg-cyan-600 text-white', label: 'Pos (正数桶)' },
  { colorBg: 'bg-emerald-500/30 border border-emerald-400', label: 'Active Check (比对组)' },
];

export const DEFAULT_INPUT: ThreeSumInput = { nums: [-1, 0, 1, 2, -1, -4] };
