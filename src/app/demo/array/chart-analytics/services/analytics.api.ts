import type { BatchUpdate, PerformanceMetrics, RangeQueryResult, TimeBucket } from '../types';

/**
 * 构建前缀和数组
 * prefixSum[i] = sum(buckets[0..i-1])
 * 时间复杂度: O(n)
 */
export function buildPrefixSum(buckets: TimeBucket[]): {
  amountPrefix: number[];
  countPrefix: number[];
  buildTime: number;
} {
  const start = performance.now();

  const n = buckets.length;
  const amountPrefix = new Array(n + 1).fill(0);
  const countPrefix = new Array(n + 1).fill(0);

  for (let i = 0; i < n; i++) {
    amountPrefix[i + 1] = amountPrefix[i] + buckets[i].totalAmount;
    countPrefix[i + 1] = countPrefix[i] + buckets[i].orderCount;
  }

  const buildTime = performance.now() - start;

  return { amountPrefix, countPrefix, buildTime };
}

/**
 * 区间查询 - 使用前缀和实现 O(1) 查询
 * rangeSum(l, r) = prefixSum[r+1] - prefixSum[l]
 */
export function rangeQuery(
  buckets: TimeBucket[],
  amountPrefix: number[],
  countPrefix: number[],
  startIdx: number,
  endIdx: number
): { result: RangeQueryResult; queryTime: number } {
  const start = performance.now();

  // 边界检查
  const warnings: string[] = [];
  if (startIdx < 0 || endIdx >= buckets.length || startIdx > endIdx) {
    warnings.push('索引越界，已自动修正');
    startIdx = Math.max(0, startIdx);
    endIdx = Math.min(buckets.length - 1, endIdx);
  }

  // O(1) 区间查询
  const totalAmount = amountPrefix[endIdx + 1] - amountPrefix[startIdx];
  const orderCount = countPrefix[endIdx + 1] - countPrefix[startIdx];

  // 统计退款
  let refundCount = 0;
  for (let i = startIdx; i <= endIdx; i++) {
    refundCount += buckets[i].refundCount;
  }

  const avgAmount = orderCount > 0 ? Math.round(totalAmount / orderCount) : 0;

  const queryTime = performance.now() - start;

  // 性能警告
  if (queryTime > 16) {
    warnings.push(`查询耗时 ${queryTime.toFixed(2)}ms，超过 16ms 阈值`);
  }

  return {
    result: { totalAmount, orderCount, refundCount, avgAmount, warnings },
    queryTime,
  };
}

/**
 * 差分数组批量更新
 * diff[l] += val, diff[r+1] -= val
 * 时间复杂度: O(1) 更新, O(n) 还原
 */
export function batchUpdate(
  buckets: TimeBucket[],
  updates: BatchUpdate[]
): { updatedBuckets: TimeBucket[]; updateTime: number } {
  const start = performance.now();

  // 构建差分数组
  const n = buckets.length;
  const diff = new Array(n + 1).fill(0);

  for (const { startIndex, endIndex, delta } of updates) {
    if (startIndex >= 0 && startIndex < n) {
      diff[startIndex] += delta;
    }
    if (endIndex + 1 < n + 1) {
      diff[endIndex + 1] -= delta;
    }
  }

  // 还原并应用到原数组
  const updatedBuckets = buckets.map((bucket) => ({
    ...bucket,
    totalAmount: bucket.totalAmount,
  }));

  let accumulated = 0;
  for (let i = 0; i < n; i++) {
    accumulated += diff[i];
    updatedBuckets[i].totalAmount += accumulated;
  }

  const updateTime = performance.now() - start;

  return { updatedBuckets, updateTime };
}

/**
 * 计算性能指标
 */
export function calculateMetrics(
  buckets: TimeBucket[],
  buildTime: number,
  queryTime: number
): PerformanceMetrics {
  // 粗略估算内存占用 (每个 bucket 约 40 bytes)
  const memoryUsage = Math.round((buckets.length * 40) / 1024);

  return {
    prefixSumBuildTime: buildTime,
    lastQueryTime: queryTime,
    totalEvents: buckets.reduce((sum, b) => sum + b.orderCount, 0),
    memoryUsage,
  };
}
