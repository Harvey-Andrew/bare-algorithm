import type { PricePoint, TimeRange } from './types';

/**
 * 生成模拟股票价格数据（一年）
 * 包含脏数据：缺失日期、重复数据
 */
export function generateMockPrices(days: number = 365): PricePoint[] {
  const prices: PricePoint[] = [];
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() - days);

  let lastClose = 10000 + Math.floor(Math.random() * 5000); // 100-150 元

  for (let i = 0; i < days; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + i);

    // 周末跳过（模拟真实市场）
    if (date.getDay() === 0 || date.getDay() === 6) {
      continue;
    }

    // 随机缺失数据（约 2%）
    if (Math.random() < 0.02) {
      continue;
    }

    // 生成价格波动（-5% ~ +5%）
    const changePercent = (Math.random() - 0.5) * 0.1;
    const open = lastClose;
    const close = Math.round(lastClose * (1 + changePercent));

    // 确保最高价和最低价合理
    const high = Math.round(Math.max(open, close) * (1 + Math.random() * 0.02));
    const low = Math.round(Math.min(open, close) * (1 - Math.random() * 0.02));

    const dateStr = date.toISOString().split('T')[0];

    prices.push({
      date: dateStr,
      timestamp: date.getTime(),
      open,
      close,
      high,
      low,
      volume: Math.floor(Math.random() * 1000000) + 100000,
    });

    lastClose = close;
  }

  // 添加一些重复数据（约 1%）
  const duplicateCount = Math.floor(prices.length * 0.01);
  for (let i = 0; i < duplicateCount; i++) {
    const randomIndex = Math.floor(Math.random() * prices.length);
    prices.push({ ...prices[randomIndex] });
  }

  // 打乱顺序模拟乱序到达
  return prices.sort((a, b) => a.timestamp - b.timestamp);
}

/**
 * 时间范围映射（天数）
 */
export const TIME_RANGE_DAYS: Record<TimeRange, number> = {
  '1M': 30,
  '3M': 90,
  '6M': 180,
  '1Y': 365,
  ALL: 9999,
};

/**
 * 配置
 */
export const CONFIG = {
  /** 默认数据天数 */
  DEFAULT_DAYS: 365,
  /** 长任务阈值 */
  LONG_TASK_THRESHOLD: 16,
};

/**
 * 股票信息
 */
export const STOCK_INFO = {
  code: 'DEMO',
  name: '示例科技',
  industry: '信息技术',
};
