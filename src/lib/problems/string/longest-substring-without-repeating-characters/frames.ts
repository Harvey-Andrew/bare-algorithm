import { AlgorithmMode, LongestSubstringFrame, LongestSubstringInput } from './types';

function createFrame(
  mode: AlgorithmMode,
  overrides: Partial<LongestSubstringFrame>
): LongestSubstringFrame {
  return {
    mode,
    line: 0,
    message: '',
    s: '',
    left: 0,
    right: -1,
    maxLen: 0,
    bestLeft: 0,
    bestRight: -1,
    phase: 'init',
    ...overrides,
  };
}

// ─── 滑动窗口 + Set ──────────────────────────────
export function generateSetFrames(input: LongestSubstringInput): LongestSubstringFrame[] {
  const frames: LongestSubstringFrame[] = [];
  const { s } = input;
  const n = s.length;
  const set = new Set<string>();
  let left = 0,
    maxLen = 0,
    bestLeft = 0,
    bestRight = -1;

  frames.push(
    createFrame(AlgorithmMode.SLIDING_WINDOW, {
      s,
      windowChars: [],
      line: 1,
      message: '初始化 Set 和双指针。窗口不变量：Set 内无重复字符。',
    })
  );

  for (let right = 0; right < n; right++) {
    // 检测冲突
    if (set.has(s[right])) {
      frames.push(
        createFrame(AlgorithmMode.SLIDING_WINDOW, {
          s,
          left,
          right,
          maxLen,
          bestLeft,
          bestRight,
          windowChars: Array.from(set),
          conflictChar: s[right],
          line: 4,
          message: `右指针扩展到 '${s[right]}'（index ${right}），发现重复！开始收缩左边界。`,
          phase: 'shrinking',
        })
      );
    }

    while (set.has(s[right])) {
      set.delete(s[left]);
      left++;
    }

    set.add(s[right]);
    const windowLen = right - left + 1;

    if (windowLen > maxLen) {
      maxLen = windowLen;
      bestLeft = left;
      bestRight = right;
      frames.push(
        createFrame(AlgorithmMode.SLIDING_WINDOW, {
          s,
          left,
          right,
          maxLen,
          bestLeft,
          bestRight,
          windowChars: Array.from(set),
          line: 9,
          message: `窗口 "${s.slice(left, right + 1)}" 长度 ${windowLen} 刷新最大值 → maxLen=${maxLen}！`,
          phase: 'found-max',
        })
      );
    } else {
      frames.push(
        createFrame(AlgorithmMode.SLIDING_WINDOW, {
          s,
          left,
          right,
          maxLen,
          bestLeft,
          bestRight,
          windowChars: Array.from(set),
          line: 9,
          message: `窗口 "${s.slice(left, right + 1)}" 长度 ${windowLen}，未超过当前最大 ${maxLen}。`,
          phase: 'expanding',
        })
      );
    }
  }

  frames.push(
    createFrame(AlgorithmMode.SLIDING_WINDOW, {
      s,
      left,
      right: n - 1,
      maxLen,
      bestLeft,
      bestRight,
      windowChars: Array.from(set),
      line: 11,
      message: `遍历完成。最长无重复子串为 "${s.slice(bestLeft, bestRight + 1)}"，长度 ${maxLen}。`,
      phase: 'completed',
    })
  );

  return frames;
}

// ─── 滑动窗口 + Map 优化 ─────────────────────────
export function generateMapFrames(input: LongestSubstringInput): LongestSubstringFrame[] {
  const frames: LongestSubstringFrame[] = [];
  const { s } = input;
  const n = s.length;
  const map = new Map<string, number>();
  let left = 0,
    maxLen = 0,
    bestLeft = 0,
    bestRight = -1;

  frames.push(
    createFrame(AlgorithmMode.SLIDING_WINDOW_MAP, {
      s,
      charMap: {},
      line: 1,
      message: '初始化 Map（记录字符最后出现位置）。遇重复直接跳跃 left。',
    })
  );

  for (let right = 0; right < n; right++) {
    const lastPos = map.get(s[right]);
    let jumped = false;
    let jumpFrom = left;

    if (lastPos !== undefined && lastPos >= left) {
      jumpFrom = left;
      left = lastPos + 1;
      jumped = true;

      frames.push(
        createFrame(AlgorithmMode.SLIDING_WINDOW_MAP, {
          s,
          left,
          right,
          maxLen,
          bestLeft,
          bestRight,
          charMap: Object.fromEntries(map),
          conflictChar: s[right],
          jumpFrom,
          line: 6,
          message: `'${s[right]}' 在窗口内重复（旧位置 ${lastPos}）！left 从 ${jumpFrom} 跳跃到 ${left}。`,
          phase: 'shrinking',
        })
      );
    }

    map.set(s[right], right);
    const windowLen = right - left + 1;

    if (windowLen > maxLen) {
      maxLen = windowLen;
      bestLeft = left;
      bestRight = right;
      frames.push(
        createFrame(AlgorithmMode.SLIDING_WINDOW_MAP, {
          s,
          left,
          right,
          maxLen,
          bestLeft,
          bestRight,
          charMap: Object.fromEntries(map),
          jumpFrom: jumped ? jumpFrom : undefined,
          line: 9,
          message: `窗口 "${s.slice(left, right + 1)}" 长度 ${windowLen} 刷新最大值 → maxLen=${maxLen}！`,
          phase: 'found-max',
        })
      );
    } else {
      frames.push(
        createFrame(AlgorithmMode.SLIDING_WINDOW_MAP, {
          s,
          left,
          right,
          maxLen,
          bestLeft,
          bestRight,
          charMap: Object.fromEntries(map),
          line: 9,
          message: `窗口 "${s.slice(left, right + 1)}" 长度 ${windowLen}，最大仍为 ${maxLen}。`,
          phase: 'expanding',
        })
      );
    }
  }

  frames.push(
    createFrame(AlgorithmMode.SLIDING_WINDOW_MAP, {
      s,
      left,
      right: n - 1,
      maxLen,
      bestLeft,
      bestRight,
      charMap: Object.fromEntries(map),
      line: 12,
      message: `遍历完成。最长无重复子串为 "${s.slice(bestLeft, bestRight + 1)}"，长度 ${maxLen}。`,
      phase: 'completed',
    })
  );

  return frames;
}
