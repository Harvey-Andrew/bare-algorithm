import { AlgorithmMode, FindAnagramsInput } from './types';

export const MODES = [
  {
    value: AlgorithmMode.SLIDING_WINDOW,
    label: '定长窗口 + 计数数组',
  },
  {
    value: AlgorithmMode.DIFF_OPTIMIZED,
    label: '定长窗口 + 差分计数',
  },
];

export const SW_COUNT_CODE = [
  'function findAnagrams(s, p) {',
  '  const pCount = new Array(26).fill(0);',
  '  const sCount = new Array(26).fill(0);',
  '  for (c of p) pCount[c]++;',
  '  for (let i = 0; i < s.length; i++) {',
  '    sCount[s[i]]++;',
  '    if (i >= p.length) sCount[s[i - p.length]]--;',
  '    if (i >= p.length - 1 && match(sCount, pCount))',
  '      result.push(i - p.length + 1);',
  '  }',
  '  return result;',
  '}',
];

export const SW_DIFF_CODE = [
  'function findAnagrams(s, p) {',
  '  const count = new Array(26).fill(0);',
  '  for (c of p) count[c]++;',
  '  let diff = countNonZero(count);',
  '  for (let i = 0; i < s.length; i++) {',
  '    // 加入右端',
  '    if (count[s[i]] === 0) diff++;',
  '    count[s[i]]--;',
  '    if (count[s[i]] === 0) diff--;',
  '    // 移除左端',
  '    if (i >= p.length) {',
  '      if (count[s[i-p.length]] === 0) diff++;',
  '      count[s[i-p.length]]++;',
  '      if (count[s[i-p.length]] === 0) diff--;',
  '    }',
  '    if (diff === 0) result.push(i - p.length + 1);',
  '  }',
  '  return result;',
  '}',
];

export const COUNT_LEGEND = [
  { colorBg: 'bg-blue-500 text-white', label: 'Window (窗口)' },
  { colorBg: 'bg-emerald-500 text-white', label: 'Match (匹配！)' },
  { colorBg: 'bg-rose-500/50 text-white', label: 'Removed (移出)' },
  { colorBg: 'bg-cyan-500 text-slate-950', label: 'Added (加入)' },
];

export const DIFF_LEGEND = [
  { colorBg: 'bg-amber-500 text-slate-950', label: 'Window (窗口)' },
  { colorBg: 'bg-emerald-500 text-white', label: 'Match (diff=0)' },
  { colorBg: 'bg-rose-500/50 text-white', label: 'Removed' },
  { colorBg: 'bg-cyan-500 text-slate-950', label: 'Added' },
];

export const DEFAULT_INPUT: FindAnagramsInput = { s: 'cbaebabacd', p: 'abc' };
