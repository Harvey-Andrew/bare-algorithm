'use client';

import { useMemo } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AnalysisResult, MovingAverage, PricePoint } from '../types';

interface PriceChartProps {
  prices: PricePoint[];
  maData: MovingAverage[];
  analysisResult: AnalysisResult;
}

/**
 * 价格图表组件 - 简化版 K 线图
 */
export function PriceChart({ prices, maData, analysisResult }: PriceChartProps) {
  const {
    minPrice,
    maxPrice: _maxPrice,
    priceRange,
  } = useMemo(() => {
    if (prices.length === 0) return { minPrice: 0, maxPrice: 100, priceRange: 100 };
    const allPrices = prices.flatMap((p) => [p.high, p.low]);
    const min = Math.min(...allPrices);
    const max = Math.max(...allPrices);
    return { minPrice: min, maxPrice: max, priceRange: max - min || 1 };
  }, [prices]);

  const getY = (price: number) => {
    return 180 - ((price - minPrice) / priceRange) * 160;
  };

  // 只显示最近 60 个数据点
  const displayPrices = prices.slice(-60);
  const displayMA = maData.slice(-60);
  const barWidth = 600 / displayPrices.length;

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <CardTitle className="text-white">价格走势</CardTitle>
      </CardHeader>
      <CardContent>
        <svg width="100%" height="200" viewBox="0 0 600 200" className="overflow-visible">
          {/* 背景网格 */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
            <line
              key={ratio}
              x1="0"
              y1={20 + ratio * 160}
              x2="600"
              y2={20 + ratio * 160}
              stroke="#334155"
              strokeWidth="1"
            />
          ))}

          {/* MA 线 */}
          {displayMA.length > 1 && (
            <>
              {/* MA5 */}
              <polyline
                fill="none"
                stroke="#22d3ee"
                strokeWidth="1.5"
                points={displayMA
                  .map((ma, i) => `${i * barWidth + barWidth / 2},${getY(ma.ma5)}`)
                  .join(' ')}
              />
              {/* MA10 */}
              <polyline
                fill="none"
                stroke="#a855f7"
                strokeWidth="1.5"
                points={displayMA
                  .map((ma, i) => `${i * barWidth + barWidth / 2},${getY(ma.ma10)}`)
                  .join(' ')}
              />
            </>
          )}

          {/* K 线 */}
          {displayPrices.map((price, i) => {
            const x = i * barWidth + barWidth / 2;
            const isUp = price.close >= price.open;
            const color = isUp ? '#22c55e' : '#ef4444';

            const isBuyPoint = price.date === analysisResult.buyDate;
            const isSellPoint = price.date === analysisResult.sellDate;

            return (
              <g key={price.date}>
                {/* 影线 */}
                <line
                  x1={x}
                  y1={getY(price.high)}
                  x2={x}
                  y2={getY(price.low)}
                  stroke={color}
                  strokeWidth="1"
                />
                {/* 实体 */}
                <rect
                  x={x - barWidth * 0.3}
                  y={getY(Math.max(price.open, price.close))}
                  width={barWidth * 0.6}
                  height={Math.max(2, Math.abs(getY(price.open) - getY(price.close)))}
                  fill={color}
                />
                {/* 买入点标记 */}
                {isBuyPoint && <circle cx={x} cy={getY(price.close) + 15} r="6" fill="#22d3ee" />}
                {/* 卖出点标记 */}
                {isSellPoint && <circle cx={x} cy={getY(price.close) - 15} r="6" fill="#f97316" />}
              </g>
            );
          })}
        </svg>

        {/* 图例 */}
        <div className="flex items-center gap-4 mt-4 text-xs text-slate-400">
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 bg-cyan-400" />
            <span>MA5</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 bg-purple-400" />
            <span>MA10</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-cyan-400" />
            <span>最佳买入点</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-orange-400" />
            <span>最佳卖出点</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
