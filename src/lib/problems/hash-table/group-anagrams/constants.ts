import { AlgorithmMode, GroupAnagramsInput } from './types';

export const MODES = [
  {
    value: AlgorithmMode.SORTING,
    label: '排序关联法',
  },
  {
    value: AlgorithmMode.COUNT_HASH,
    label: '频次计数哈希法',
  },
  {
    value: AlgorithmMode.PRIME_MULTIPLICATION,
    label: '质数连乘哈希法',
  },
];

export const SORTING_CODE = [
  'function groupAnagrams(strs: string[]): string[][] {',
  '  const map = new Map<string, string[]>();',
  '  for (const s of strs) {',
  '    // 把字符串拆分为数组，字母排序后拼回作 Key',
  '    const key = s.split("").sort().join("");',
  '    const group = map.get(key);',
  '    if (group !== undefined) group.push(s);',
  '    else map.set(key, [s]);',
  '  }',
  '  return Array.from(map.values());',
  '}',
];

export const COUNT_HASH_CODE = [
  'function groupAnagrams(strs: string[]): string[][] {',
  '  const map = new Map<string, string[]>();',
  '  // 复用连续内存数组极降 GC',
  '  const count = new Int32Array(26);',
  '  for (let i = 0; i < strs.length; i++) {',
  '    const s = strs[i];',
  '    count.fill(0); // 清零计数器',
  '    for (let j = 0; j < s.length; j++) {',
  '       count[s.charCodeAt(j) - 97]++;',
  '    }',
  '    // 以包含逗号分隔符的计数字符串作为唯一 Key',
  '    const key = count.join(",");',
  '    const group = map.get(key);',
  '    if (group !== undefined) group.push(s);',
  '    else map.set(key, [s]);',
  '  }',
  '  return Array.from(map.values());',
  '}',
];

export const PRIME_MULTIPLICATION_CODE = [
  'function groupAnagrams(strs: string[]): string[][] {',
  '  // 前26个素数静态表代表 a-z',
  '  const primes = [2n, 3n, 5n, 7n, 11n, 13n, /*...*/ 101n];',
  '  const map = new Map<bigint, string[]>();',
  '',
  '  for (let i = 0; i < strs.length; i++) {',
  '    const s = strs[i];',
  '    let key = 1n; // 使用 BigInt 防大整数连乘塌方溢出',
  '    for (let j = 0; j < s.length; j++) {',
  '      key *= primes[s.charCodeAt(j) - 97];',
  '    }',
  '',
  '    const group = map.get(key);',
  '    if (group !== undefined) group.push(s);',
  '    else map.set(key, [s]);',
  '  }',
  '  return Array.from(map.values());',
  '}',
];

export const LEGEND_ITEMS = [
  { colorBg: 'bg-emerald-500', label: '新哈希键分组' },
  { colorBg: 'bg-blue-500', label: '当前处理字符串' },
  { colorBg: 'bg-slate-700', label: '已规整完毕分组' },
];

export const DEFAULT_INPUT: GroupAnagramsInput = {
  strs: ['eat', 'tea', 'tan', 'ate', 'nat', 'bat'],
};
