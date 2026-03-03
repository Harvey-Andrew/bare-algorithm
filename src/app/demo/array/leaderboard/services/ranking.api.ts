import type { Player, RankEntry, TopKParams } from '../types';

/**
 * 使用完整排序获取 Top-K
 * 时间复杂度: O(n log n)
 */
export function getTopKBySort(
  players: Player[],
  k: number
): {
  entries: RankEntry[];
  sortTime: number;
} {
  const start = performance.now();

  const sorted = [...players].sort((a, b) => b.score - a.score);
  const topK = sorted.slice(0, k);

  const entries: RankEntry[] = topK.map((player, idx) => ({
    rank: idx + 1,
    player,
    rankChange: 0, // 初始无变化
  }));

  const sortTime = performance.now() - start;
  return { entries, sortTime };
}

/**
 * 使用快速选择获取 Top-K（简化版）
 * 平均时间复杂度: O(n)，最坏 O(n²)
 */
export function getTopKByQuickSelect(
  players: Player[],
  k: number
): {
  entries: RankEntry[];
  selectTime: number;
} {
  const start = performance.now();

  // 快速选择找到第 k 大元素，然后取前 k 个
  const arr = [...players];
  const kthScore = quickSelect(arr, 0, arr.length - 1, k);

  // 过滤出 >= kthScore 的元素并排序
  const topK = arr
    .filter((p) => p.score >= kthScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);

  const entries: RankEntry[] = topK.map((player, idx) => ({
    rank: idx + 1,
    player,
    rankChange: 0,
  }));

  const selectTime = performance.now() - start;
  return { entries, selectTime };
}

/**
 * 快速选择算法（找第 k 大）
 */
function quickSelect(arr: Player[], left: number, right: number, k: number): number {
  if (left === right) return arr[left].score;

  const pivotIdx = partition(arr, left, right);
  const rank = pivotIdx - left + 1;

  if (rank === k) {
    return arr[pivotIdx].score;
  } else if (rank > k) {
    return quickSelect(arr, left, pivotIdx - 1, k);
  } else {
    return quickSelect(arr, pivotIdx + 1, right, k - rank);
  }
}

/**
 * 分区函数（按 score 降序）
 */
function partition(arr: Player[], left: number, right: number): number {
  const pivot = arr[right].score;
  let i = left;

  for (let j = left; j < right; j++) {
    if (arr[j].score >= pivot) {
      [arr[i], arr[j]] = [arr[j], arr[i]];
      i++;
    }
  }
  [arr[i], arr[right]] = [arr[right], arr[i]];
  return i;
}

/**
 * 使用最小堆获取 Top-K
 * 时间复杂度: O(n log k)
 */
export function getTopKByHeap(
  players: Player[],
  k: number
): {
  entries: RankEntry[];
  heapTime: number;
} {
  const start = performance.now();

  // 简化版：使用数组模拟最小堆
  const minHeap: Player[] = [];

  for (const player of players) {
    if (minHeap.length < k) {
      minHeap.push(player);
      minHeap.sort((a, b) => a.score - b.score); // 维护堆顺序
    } else if (player.score > minHeap[0].score) {
      minHeap[0] = player;
      minHeap.sort((a, b) => a.score - b.score);
    }
  }

  // 按降序输出
  const topK = minHeap.sort((a, b) => b.score - a.score);

  const entries: RankEntry[] = topK.map((player, idx) => ({
    rank: idx + 1,
    player,
    rankChange: 0,
  }));

  const heapTime = performance.now() - start;
  return { entries, heapTime };
}

/**
 * 统一的 Top-K 查询接口
 */
export function getTopK(
  players: Player[],
  params: TopKParams
): {
  entries: RankEntry[];
  time: number;
  algorithm: string;
} {
  switch (params.algorithm) {
    case 'quickSelect': {
      const { entries, selectTime } = getTopKByQuickSelect(players, params.k);
      return { entries, time: selectTime, algorithm: '快速选择 O(n)' };
    }
    case 'heap': {
      const { entries, heapTime } = getTopKByHeap(players, params.k);
      return { entries, time: heapTime, algorithm: '最小堆 O(n log k)' };
    }
    default: {
      const { entries, sortTime } = getTopKBySort(players, params.k);
      return { entries, time: sortTime, algorithm: '完整排序 O(n log n)' };
    }
  }
}

/**
 * 模拟积分变更
 */
export function simulateScoreChange(players: Player[]): Player[] {
  const updated = [...players];
  const changeCount = Math.floor(players.length * 0.01); // 1% 玩家积分变化

  for (let i = 0; i < changeCount; i++) {
    const idx = Math.floor(Math.random() * updated.length);
    const delta = Math.floor(Math.random() * 1000) - 300; // -300 ~ +700
    updated[idx] = {
      ...updated[idx],
      score: Math.max(0, updated[idx].score + delta),
    };
  }

  return updated;
}

/**
 * 计算排名变化
 */
export function calculateRankChanges(
  oldEntries: RankEntry[],
  newEntries: RankEntry[]
): RankEntry[] {
  const oldRankMap = new Map<string, number>();
  for (const entry of oldEntries) {
    oldRankMap.set(entry.player.id, entry.rank);
  }

  return newEntries.map((entry) => {
    const oldRank = oldRankMap.get(entry.player.id);
    const rankChange = oldRank ? oldRank - entry.rank : 0;
    return { ...entry, rankChange };
  });
}
