'use client';

/**
 * 订单事件 - 模拟 WebSocket 推送的数据结构
 */
export interface OrderEvent {
  orderId: string;
  timestamp: number; // Unix 时间戳（秒）
  amount: number; // 订单金额（分）
  categoryId?: string; // 商品类目
  regionCode?: string; // 地区编码
  isRefund?: boolean; // 退款标记
}

/**
 * 时间桶 - 按分钟聚合的数据
 */
export interface TimeBucket {
  timestamp: number; // 分钟开始时间戳
  totalAmount: number; // 该分钟总金额
  orderCount: number; // 该分钟订单数
  refundCount: number; // 退款数
}

/**
 * 区间查询结果
 */
export interface RangeQueryResult {
  totalAmount: number;
  orderCount: number;
  refundCount: number;
  avgAmount: number;
  warnings: string[];
}

/**
 * 批量更新操作
 */
export interface BatchUpdate {
  startIndex: number;
  endIndex: number;
  delta: number; // 调整值
}

/**
 * 性能指标
 */
export interface PerformanceMetrics {
  prefixSumBuildTime: number; // 前缀和构建耗时(ms)
  lastQueryTime: number; // 最近查询耗时(ms)
  totalEvents: number; // 总事件数
  memoryUsage: number; // 内存占用估算(KB)
}
