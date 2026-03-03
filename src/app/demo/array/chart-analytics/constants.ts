import type { OrderEvent, TimeBucket } from './types';

/**
 * 模拟 24 小时的订单事件数据
 * 每分钟 1-10 笔订单，包含异常数据
 */
export function generateMockEvents(hours: number = 2): OrderEvent[] {
  const events: OrderEvent[] = [];
  const baseTime = Math.floor(Date.now() / 1000) - hours * 3600;
  const categories = ['electronics', 'clothing', 'food', 'books', 'home'];
  const regions = ['BJ', 'SH', 'GZ', 'SZ', 'HZ'];

  let orderId = 1;
  for (let minute = 0; minute < hours * 60; minute++) {
    const orderCount = Math.floor(Math.random() * 10) + 1;
    for (let i = 0; i < orderCount; i++) {
      const timestamp = baseTime + minute * 60 + Math.floor(Math.random() * 60);
      const isRefund = Math.random() < 0.05; // 5% 退款率
      const amount = isRefund
        ? -Math.floor(Math.random() * 50000) - 1000
        : Math.floor(Math.random() * 100000) + 100;

      events.push({
        orderId: `ORD${String(orderId++).padStart(6, '0')}`,
        timestamp,
        amount,
        categoryId: categories[Math.floor(Math.random() * categories.length)],
        regionCode: regions[Math.floor(Math.random() * regions.length)],
        isRefund,
      });
    }
  }

  // 添加一些异常数据 - 重复 orderId
  if (events.length > 10) {
    events.push({ ...events[5], timestamp: events[5].timestamp + 10 });
  }

  // 乱序
  return events.sort(() => Math.random() - 0.5);
}

/**
 * 将事件聚合为时间桶（按分钟）
 */
export function aggregateToTimeBuckets(events: OrderEvent[]): TimeBucket[] {
  const bucketMap = new Map<number, TimeBucket>();

  for (const event of events) {
    const bucketTime = Math.floor(event.timestamp / 60) * 60;

    if (!bucketMap.has(bucketTime)) {
      bucketMap.set(bucketTime, {
        timestamp: bucketTime,
        totalAmount: 0,
        orderCount: 0,
        refundCount: 0,
      });
    }

    const bucket = bucketMap.get(bucketTime)!;
    bucket.totalAmount += event.amount;
    bucket.orderCount += 1;
    if (event.isRefund) {
      bucket.refundCount += 1;
    }
  }

  return Array.from(bucketMap.values()).sort((a, b) => a.timestamp - b.timestamp);
}

/**
 * 默认配置
 */
export const CONFIG = {
  /** 数据保留时间（小时） */
  DATA_RETENTION_HOURS: 2,
  /** 查询超时警告阈值（ms） */
  QUERY_WARN_THRESHOLD: 16,
  /** 长任务阈值（ms） */
  LONG_TASK_THRESHOLD: 50,
};
