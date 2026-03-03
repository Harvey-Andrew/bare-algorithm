import { AlgorithmMode, LongestSubstringInput } from './types';

export const MODES = [
  {
    value: AlgorithmMode.SLIDING_WINDOW,
    label: '滑动窗口 + 集合',
  },
  {
    value: AlgorithmMode.SLIDING_WINDOW_MAP,
    label: '滑动窗口 + 哈希表（跳跃）',
  },
];

export const SW_SET_CODE = [
  'function lengthOfLongestSubstring(s) {',
  '  const set = new Set();',
  '  let left = 0, maxLen = 0;',
  '  for (let right = 0; right < s.length; right++) {',
  '    while (set.has(s[right])) {',
  '      set.delete(s[left]);',
  '      left++;',
  '    }',
  '    set.add(s[right]);',
  '    maxLen = Math.max(maxLen, right - left + 1);',
  '  }',
  '  return maxLen;',
  '}',
];

export const SW_MAP_CODE = [
  'function lengthOfLongestSubstring(s) {',
  '  const map = new Map();',
  '  let left = 0, maxLen = 0;',
  '  for (let right = 0; right < s.length; right++) {',
  '    const lastPos = map.get(s[right]);',
  '    if (lastPos !== undefined && lastPos >= left) {',
  '      left = lastPos + 1; // 跳跃收缩',
  '    }',
  '    map.set(s[right], right);',
  '    maxLen = Math.max(maxLen, right - left + 1);',
  '  }',
  '  return maxLen;',
  '}',
];

export const SET_LEGEND = [
  { colorBg: 'bg-blue-500 text-white', label: 'Window (窗口)' },
  { colorBg: 'bg-amber-500 text-slate-950', label: 'Left' },
  { colorBg: 'bg-cyan-500 text-slate-950', label: 'Right' },
  { colorBg: 'bg-rose-500/50 border border-rose-500 border-dashed', label: 'Conflict (重复)' },
];

export const MAP_LEGEND = [
  { colorBg: 'bg-emerald-500 text-white', label: 'Window (窗口)' },
  { colorBg: 'bg-amber-500 text-slate-950', label: 'Left' },
  { colorBg: 'bg-cyan-500 text-slate-950', label: 'Right' },
  { colorBg: 'bg-rose-500/50 border border-rose-500 border-dashed', label: 'Jump (跳跃收缩)' },
];

export const DEFAULT_INPUT: LongestSubstringInput = { s: 'abcabcbb' };
