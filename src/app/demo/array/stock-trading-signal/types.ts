'use client';

/**
 * 价格数据点 - 模拟股票历史价格
 */
export interface PricePoint {
  /** 日期 */
  date: string;
  /** 时间戳 */
  timestamp: number;
  /** 开盘价（分） */
  open: number;
  /** 收盘价（分） */
  close: number;
  /** 最高价（分） */
  high: number;
  /** 最低价（分） */
  low: number;
  /** 成交量 */
  volume: number;
}

/**
 * 交易信号
 */
export interface TradeSignal {
  /** 信号类型 */
  type: 'buy' | 'sell' | 'hold';
  /** 触发日期 */
  date: string;
  /** 触发价格 */
  price: number;
  /** 信号原因 */
  reason: string;
}

/**
 * 分析结果 - 单次交易最大利润
 */
export interface AnalysisResult {
  /** 最佳买入日 */
  buyDate: string;
  /** 买入价格 */
  buyPrice: number;
  /** 最佳卖出日 */
  sellDate: string;
  /** 卖出价格 */
  sellPrice: number;
  /** 最大利润（分） */
  maxProfit: number;
  /** 收益率 */
  profitRate: number;
  /** 是否有盈利机会 */
  hasProfitOpportunity: boolean;
}

/**
 * 移动平均线数据
 */
export interface MovingAverage {
  /** 日期 */
  date: string;
  /** MA5 */
  ma5: number;
  /** MA10 */
  ma10: number;
  /** MA20 */
  ma20: number;
}

/**
 * 性能指标
 */
export interface PerformanceMetrics {
  /** 分析耗时 */
  analysisTime: number;
  /** 数据点数量 */
  dataPoints: number;
  /** MA 计算耗时 */
  maCalcTime: number;
}

/**
 * 时间范围
 */
export type TimeRange = '1M' | '3M' | '6M' | '1Y' | 'ALL';
