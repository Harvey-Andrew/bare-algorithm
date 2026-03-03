import type { Message, VirtualListConfig, VisibleRange } from '../types';

/**
 * 计算可见区域范围
 * 使用数学计算直接定位索引，时间复杂度 O(1)
 *
 * @param scrollTop - 滚动位置
 * @param containerHeight - 容器高度
 * @param totalItems - 总数据量
 * @param config - 虚拟列表配置
 * @returns 可见区域信息
 */
export function calculateVisibleRange(
  scrollTop: number,
  containerHeight: number,
  totalItems: number,
  config: VirtualListConfig
): { range: VisibleRange; calcTime: number } {
  const start = performance.now();

  const { itemHeight, overscan } = config;

  // 计算起始索引（向下取整）
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);

  // 计算结束索引（向上取整 + 缓冲区）
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const endIndex = Math.min(
    totalItems - 1,
    Math.floor(scrollTop / itemHeight) + visibleCount + overscan
  );

  // 计算起始偏移量
  const offsetTop = startIndex * itemHeight;

  const calcTime = performance.now() - start;

  return {
    range: { startIndex, endIndex, offsetTop },
    calcTime,
  };
}

/**
 * 获取可见区域的数据切片
 * 时间复杂度 O(k)，k 为可见项数
 */
export function getVisibleItems(items: Message[], range: VisibleRange): Message[] {
  return items.slice(range.startIndex, range.endIndex + 1);
}

/**
 * 计算总内容高度
 */
export function calculateTotalHeight(totalItems: number, itemHeight: number): number {
  return totalItems * itemHeight;
}

/**
 * 滚动到指定索引
 */
export function scrollToIndex(
  index: number,
  itemHeight: number,
  containerRef: React.RefObject<HTMLDivElement>
): void {
  if (containerRef.current) {
    containerRef.current.scrollTop = index * itemHeight;
  }
}

/**
 * 二分查找定位索引（用于变高度场景扩展）
 * 当前固定高度下使用直接计算，此函数留作扩展
 */
export function binarySearchIndex(heights: number[], scrollTop: number): number {
  let left = 0;
  let right = heights.length - 1;

  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    if (heights[mid] < scrollTop) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }

  return left;
}

/**
 * 格式化时间显示
 */
export function formatMessageTime(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - timestamp;

  // 1 分钟内
  if (diff < 60000) {
    return '刚刚';
  }

  // 1 小时内
  if (diff < 3600000) {
    return `${Math.floor(diff / 60000)} 分钟前`;
  }

  // 今天
  if (date.toDateString() === now.toDateString()) {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }

  // 昨天
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return '昨天';
  }

  // 更早
  return `${date.getMonth() + 1}/${date.getDate()}`;
}
