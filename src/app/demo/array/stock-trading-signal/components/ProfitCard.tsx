'use client';

import { ArrowDown, ArrowUp, TrendingUp } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPercent, formatPrice } from '../services/stock.api';
import type { AnalysisResult } from '../types';

interface ProfitCardProps {
  result: AnalysisResult;
}

/**
 * 利润统计卡片组件
 */
export function ProfitCard({ result }: ProfitCardProps) {
  const isProfitable = result.hasProfitOpportunity;

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-lg flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-cyan-400" />
          最佳交易时机
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isProfitable ? (
          <>
            {/* 买入信息 */}
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <div className="flex items-center gap-2 text-green-400 mb-2">
                <ArrowDown className="w-4 h-4" />
                <span className="font-medium">买入</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-slate-400">日期</span>
                  <p className="text-white">{result.buyDate}</p>
                </div>
                <div>
                  <span className="text-slate-400">价格</span>
                  <p className="text-white font-mono">{formatPrice(result.buyPrice)}</p>
                </div>
              </div>
            </div>

            {/* 卖出信息 */}
            <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
              <div className="flex items-center gap-2 text-orange-400 mb-2">
                <ArrowUp className="w-4 h-4" />
                <span className="font-medium">卖出</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-slate-400">日期</span>
                  <p className="text-white">{result.sellDate}</p>
                </div>
                <div>
                  <span className="text-slate-400">价格</span>
                  <p className="text-white font-mono">{formatPrice(result.sellPrice)}</p>
                </div>
              </div>
            </div>

            {/* 利润 */}
            <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-cyan-400">最大利润</span>
                <span className="text-cyan-400 font-mono font-bold text-xl">
                  {formatPrice(result.maxProfit)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">收益率</span>
                <span className="text-green-400 font-mono">
                  +{formatPercent(result.profitRate)}
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-center">
            <p className="text-red-400">该时间段内无盈利机会</p>
            <p className="text-sm text-slate-500 mt-1">价格持续下跌或波动过小</p>
          </div>
        )}

        {/* 算法说明 */}
        <div className="text-xs text-slate-500">
          <p>• 一次遍历 O(n)：跟踪最小买入价</p>
          <p>• 计算当前卖出利润，更新最大值</p>
        </div>
      </CardContent>
    </Card>
  );
}
