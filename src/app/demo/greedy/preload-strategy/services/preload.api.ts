import type { Resource } from '../types';

/**
 * 贪心策略：按优先级 + 视口内优先排序
 */
export function sortByGreedy(resources: Resource[]): Resource[] {
  return [...resources].sort((a, b) => {
    // 视口内优先
    if (a.inViewport !== b.inViewport) return a.inViewport ? -1 : 1;
    // 优先级高优先
    return b.priority - a.priority;
  });
}

/**
 * 计算加载时间(基于大小和带宽)
 */
export function calculateLoadTime(size: number, bandwidth: number): number {
  return (size / bandwidth) * 1000; // ms
}
