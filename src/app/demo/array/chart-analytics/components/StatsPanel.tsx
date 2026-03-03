'use client';

import { AlertTriangle, RotateCcw, ShoppingCart, TrendingUp } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { RangeQueryResult } from '../types';

interface StatsPanelProps {
  result: RangeQueryResult | null;
}

/**
 * 统计面板组件 - 展示查询结果
 */
export function StatsPanel({ result }: StatsPanelProps) {
  if (!result) {
    return (
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white text-base">查询结果</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500 text-sm">请选择区间并执行查询</p>
        </CardContent>
      </Card>
    );
  }

  const formatAmount = (amount: number) => {
    const yuan = amount / 100;
    if (Math.abs(yuan) >= 10000) {
      return `¥${(yuan / 10000).toFixed(2)}万`;
    }
    return `¥${yuan.toFixed(2)}`;
  };

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <CardTitle className="text-white text-base">查询结果</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 统计数据 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-slate-800 rounded-lg">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <TrendingUp className="w-3 h-3" />
              总金额
            </div>
            <div
              className={`text-lg font-bold ${result.totalAmount >= 0 ? 'text-green-400' : 'text-red-400'}`}
            >
              {formatAmount(result.totalAmount)}
            </div>
          </div>

          <div className="p-3 bg-slate-800 rounded-lg">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <ShoppingCart className="w-3 h-3" />
              订单数
            </div>
            <div className="text-lg font-bold text-cyan-400">{result.orderCount}</div>
          </div>

          <div className="p-3 bg-slate-800 rounded-lg">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <RotateCcw className="w-3 h-3" />
              退款数
            </div>
            <div className="text-lg font-bold text-orange-400">{result.refundCount}</div>
          </div>

          <div className="p-3 bg-slate-800 rounded-lg">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <TrendingUp className="w-3 h-3" />
              客单价
            </div>
            <div className="text-lg font-bold text-purple-400">
              {formatAmount(result.avgAmount)}
            </div>
          </div>
        </div>

        {/* 警告信息 */}
        {result.warnings.length > 0 && (
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-500 text-sm mb-1">
              <AlertTriangle className="w-4 h-4" />
              警告
            </div>
            <ul className="text-yellow-400/80 text-xs space-y-1">
              {result.warnings.map((w, i) => (
                <li key={i}>• {w}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
