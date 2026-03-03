import { AlgorithmMode, FindAnagramsFrame, FindAnagramsInput } from './types';

function createFrame(
  mode: AlgorithmMode,
  overrides: Partial<FindAnagramsFrame>
): FindAnagramsFrame {
  return {
    mode,
    line: 0,
    message: '',
    s: '',
    p: '',
    left: 0,
    right: -1,
    result: [],
    pCount: {},
    sCount: {},
    phase: 'init',
    ...overrides,
  };
}

function charFreq(str: string): Record<string, number> {
  const freq: Record<string, number> = {};
  for (const c of str) freq[c] = (freq[c] || 0) + 1;
  return freq;
}

function countsMatch(a: Record<string, number>, b: Record<string, number>): boolean {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const k of keys) {
    if ((a[k] || 0) !== (b[k] || 0)) return false;
  }
  return true;
}

// ─── 定长滑窗 + Count 数组 ──────────────────────
export function generateCountFrames(input: FindAnagramsInput): FindAnagramsFrame[] {
  const frames: FindAnagramsFrame[] = [];
  const { s, p } = input;
  const n = s.length;
  const k = p.length;
  const pCount = charFreq(p);
  const sCount: Record<string, number> = {};
  const result: number[] = [];

  frames.push(
    createFrame(AlgorithmMode.SLIDING_WINDOW, {
      s,
      p,
      pCount: { ...pCount },
      sCount: {},
      line: 1,
      message: `统计 p="${p}" 的字符频率，准备定长窗口（长度 ${k}）。`,
    })
  );

  for (let i = 0; i < n; i++) {
    // 加入右端字符
    sCount[s[i]] = (sCount[s[i]] || 0) + 1;
    const addedChar = s[i];

    // 移除左端字符
    let removedChar: string | undefined;
    if (i >= k) {
      const leftChar = s[i - k];
      sCount[leftChar]--;
      if (sCount[leftChar] === 0) delete sCount[leftChar];
      removedChar = leftChar;
    }

    const left = Math.max(0, i - k + 1);
    const right = i;
    const isMatch = i >= k - 1 && countsMatch(sCount, pCount);

    if (isMatch) result.push(left);

    frames.push(
      createFrame(AlgorithmMode.SLIDING_WINDOW, {
        s,
        p,
        left,
        right,
        pCount: { ...pCount },
        sCount: { ...sCount },
        result: [...result],
        addedChar,
        removedChar,
        line: isMatch ? 8 : 5,
        message: isMatch
          ? `窗口 "${s.slice(left, right + 1)}" 的频率与 p 完全匹配！记录起始索引 ${left}。`
          : i < k - 1
            ? `构建初始窗口：加入 '${addedChar}'，窗口 "${s.slice(0, i + 1)}"（${i + 1}/${k}）。`
            : `窗口滑动 → "${s.slice(left, right + 1)}"，加入 '${addedChar}'${removedChar ? `，移除 '${removedChar}'` : ''}。频率不匹配。`,
        phase: isMatch ? 'match' : i < k - 1 ? 'expanding' : 'sliding',
      })
    );
  }

  frames.push(
    createFrame(AlgorithmMode.SLIDING_WINDOW, {
      s,
      p,
      left: 0,
      right: n - 1,
      pCount: { ...pCount },
      sCount: { ...sCount },
      result: [...result],
      line: 10,
      message: `遍历完成。共找到 ${result.length} 个异位词，起始位置：[${result.join(', ')}]。`,
      phase: 'completed',
    })
  );

  return frames;
}

// ─── 定长滑窗 + diff 优化 ────────────────────────
export function generateDiffFrames(input: FindAnagramsInput): FindAnagramsFrame[] {
  const frames: FindAnagramsFrame[] = [];
  const { s, p } = input;
  const n = s.length;
  const k = p.length;
  const pCount = charFreq(p);
  const count: Record<string, number> = { ...pCount };
  const result: number[] = [];

  // 计算初始 diff
  let diff = Object.values(count).filter((v) => v !== 0).length;

  frames.push(
    createFrame(AlgorithmMode.DIFF_OPTIMIZED, {
      s,
      p,
      pCount: { ...pCount },
      sCount: { ...count },
      diff,
      line: 1,
      message: `初始化 count = p 的频率。diff=${diff}（有 ${diff} 种字符频率不为零）。`,
    })
  );

  for (let i = 0; i < n; i++) {
    const addedChar = s[i];

    // 加入右端
    if ((count[addedChar] || 0) === 0) diff++;
    count[addedChar] = (count[addedChar] || 0) - 1;
    if (count[addedChar] === 0) diff--;

    // 移除左端
    let removedChar: string | undefined;
    if (i >= k) {
      const leftChar = s[i - k];
      removedChar = leftChar;
      if ((count[leftChar] || 0) === 0) diff++;
      count[leftChar] = (count[leftChar] || 0) + 1;
      if (count[leftChar] === 0) diff--;
    }

    const left = Math.max(0, i - k + 1);
    const right = i;
    const isMatch = i >= k - 1 && diff === 0;

    if (isMatch) result.push(left);

    // 构建 sCount 用于显示（从 count 反推窗口频率）
    const sCount: Record<string, number> = {};
    for (let c = left; c <= right; c++) {
      sCount[s[c]] = (sCount[s[c]] || 0) + 1;
    }

    frames.push(
      createFrame(AlgorithmMode.DIFF_OPTIMIZED, {
        s,
        p,
        left,
        right,
        pCount: { ...pCount },
        sCount: { ...sCount },
        result: [...result],
        diff,
        addedChar,
        removedChar,
        line: isMatch ? 16 : 5,
        message: isMatch
          ? `diff=0！窗口 "${s.slice(left, right + 1)}" 是异位词！记录索引 ${left}。`
          : `加入'${addedChar}'${removedChar ? `，移出'${removedChar}'` : ''}。diff=${diff}。`,
        phase: isMatch ? 'match' : i < k - 1 ? 'expanding' : 'sliding',
      })
    );
  }

  frames.push(
    createFrame(AlgorithmMode.DIFF_OPTIMIZED, {
      s,
      p,
      left: 0,
      right: n - 1,
      pCount: { ...pCount },
      sCount: {},
      result: [...result],
      diff,
      line: 17,
      message: `完成。共 ${result.length} 个异位词：[${result.join(', ')}]。`,
      phase: 'completed',
    })
  );

  return frames;
}
