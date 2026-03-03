/**
 * 二分查找定位起始索引
 */
export function findStartIndex(prefixSum: number[], scrollTop: number): number {
  let left = 0;
  let right = prefixSum.length - 1;

  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    if (prefixSum[mid] <= scrollTop) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }

  return Math.max(0, left - 1);
}

/**
 * 计算累积高度数组
 */
export function buildPrefixSum(heights: number[]): number[] {
  const prefixSum: number[] = [0];
  for (const h of heights) {
    prefixSum.push(prefixSum[prefixSum.length - 1] + h);
  }
  return prefixSum;
}
