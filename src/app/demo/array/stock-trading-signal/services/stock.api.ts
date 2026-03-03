import type { AnalysisResult, MovingAverage, PricePoint, TradeSignal } from '../types';

/**
 * 计算单次交易最大利润
 * 使用一次遍历算法，时间复杂度 O(n)
 *
 * 核心思路：遍历价格数组，持续跟踪最小买入价；
 * 对于每个价格，计算如果在此卖出的利润，更新最大利润。
 */
export function calculateMaxProfit(prices: PricePoint[]): {
  result: AnalysisResult;
  calcTime: number;
} {
  const start = performance.now();

  if (prices.length < 2) {
    return {
      result: {
        buyDate: '',
        buyPrice: 0,
        sellDate: '',
        sellPrice: 0,
        maxProfit: 0,
        profitRate: 0,
        hasProfitOpportunity: false,
      },
      calcTime: performance.now() - start,
    };
  }

  let minPrice = prices[0].close;
  let minPriceDate = prices[0].date;
  let maxProfit = 0;
  let buyDate = prices[0].date;
  let buyPrice = prices[0].close;
  let sellDate = prices[0].date;
  let sellPrice = prices[0].close;

  for (let i = 1; i < prices.length; i++) {
    const currentPrice = prices[i].close;
    const currentDate = prices[i].date;

    // 如果当前价格更低，更新最小买入价
    if (currentPrice < minPrice) {
      minPrice = currentPrice;
      minPriceDate = currentDate;
    } else {
      // 计算当前利润
      const profit = currentPrice - minPrice;
      if (profit > maxProfit) {
        maxProfit = profit;
        buyDate = minPriceDate;
        buyPrice = minPrice;
        sellDate = currentDate;
        sellPrice = currentPrice;
      }
    }
  }

  const calcTime = performance.now() - start;

  return {
    result: {
      buyDate,
      buyPrice,
      sellDate,
      sellPrice,
      maxProfit,
      profitRate: buyPrice > 0 ? maxProfit / buyPrice : 0,
      hasProfitOpportunity: maxProfit > 0,
    },
    calcTime,
  };
}

/**
 * 计算移动平均线
 * 时间复杂度 O(n)
 */
export function calculateMovingAverages(prices: PricePoint[]): {
  maData: MovingAverage[];
  calcTime: number;
} {
  const start = performance.now();
  const maData: MovingAverage[] = [];

  for (let i = 0; i < prices.length; i++) {
    const ma5 = calculateMA(prices, i, 5);
    const ma10 = calculateMA(prices, i, 10);
    const ma20 = calculateMA(prices, i, 20);

    maData.push({
      date: prices[i].date,
      ma5,
      ma10,
      ma20,
    });
  }

  const calcTime = performance.now() - start;

  return { maData, calcTime };
}

/**
 * 计算单个 MA 值
 */
function calculateMA(prices: PricePoint[], endIndex: number, period: number): number {
  const startIndex = Math.max(0, endIndex - period + 1);
  const slice = prices.slice(startIndex, endIndex + 1);
  if (slice.length === 0) return 0;

  const sum = slice.reduce((acc, p) => acc + p.close, 0);
  return Math.round(sum / slice.length);
}

/**
 * 生成交易信号（基于 MA 金叉/死叉）
 */
export function generateTradeSignals(prices: PricePoint[], maData: MovingAverage[]): TradeSignal[] {
  const signals: TradeSignal[] = [];

  for (let i = 1; i < maData.length; i++) {
    const prev = maData[i - 1];
    const curr = maData[i];

    // 金叉：MA5 上穿 MA10
    if (prev.ma5 <= prev.ma10 && curr.ma5 > curr.ma10) {
      signals.push({
        type: 'buy',
        date: curr.date,
        price: prices[i].close,
        reason: 'MA5 上穿 MA10（金叉）',
      });
    }

    // 死叉：MA5 下穿 MA10
    if (prev.ma5 >= prev.ma10 && curr.ma5 < curr.ma10) {
      signals.push({
        type: 'sell',
        date: curr.date,
        price: prices[i].close,
        reason: 'MA5 下穿 MA10（死叉）',
      });
    }
  }

  return signals;
}

/**
 * 去重价格数据（按日期）
 */
export function deduplicatePrices(prices: PricePoint[]): PricePoint[] {
  const seen = new Set<string>();
  return prices.filter((p) => {
    if (seen.has(p.date)) {
      return false;
    }
    seen.add(p.date);
    return true;
  });
}

/**
 * 按时间范围过滤价格数据
 */
export function filterByTimeRange(prices: PricePoint[], days: number): PricePoint[] {
  if (days >= prices.length) return prices;

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  const cutoffTimestamp = cutoffDate.getTime();

  return prices.filter((p) => p.timestamp >= cutoffTimestamp);
}

/**
 * 格式化价格（分 → 元）
 */
export function formatPrice(cents: number): string {
  return `¥${(cents / 100).toFixed(2)}`;
}

/**
 * 格式化百分比
 */
export function formatPercent(ratio: number): string {
  return `${(ratio * 100).toFixed(2)}%`;
}
