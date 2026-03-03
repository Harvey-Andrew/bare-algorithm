'use client';

import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPrice } from '../services/stock.api';
import type { TradeSignal } from '../types';

interface SignalPanelProps {
  signals: TradeSignal[];
}

/**
 * 交易信号面板组件
 */
export function SignalPanel({ signals }: SignalPanelProps) {
  // 只显示最近 10 条信号
  const recentSignals = signals.slice(-10).reverse();

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-lg">交易信号</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {recentSignals.length > 0 ? (
            recentSignals.map((signal, idx) => (
              <div
                key={`${signal.date}-${idx}`}
                className={`flex items-center gap-3 p-2 rounded-lg ${
                  signal.type === 'buy'
                    ? 'bg-green-500/10 border border-green-500/20'
                    : signal.type === 'sell'
                      ? 'bg-red-500/10 border border-red-500/20'
                      : 'bg-slate-800/50'
                }`}
              >
                {signal.type === 'buy' ? (
                  <ArrowDownCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                ) : (
                  <ArrowUpCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm font-medium ${
                        signal.type === 'buy' ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {signal.type === 'buy' ? '买入' : '卖出'}
                    </span>
                    <span className="text-xs text-slate-400">{signal.date}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs mt-0.5">
                    <span className="text-slate-500 truncate">{signal.reason}</span>
                    <span className="text-white font-mono">{formatPrice(signal.price)}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-slate-500 text-sm">暂无交易信号</div>
          )}
        </div>

        <div className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-800">
          <p>• 基于 MA5/MA10 金叉死叉策略</p>
          <p>• 显示最近 10 条信号</p>
        </div>
      </CardContent>
    </Card>
  );
}
