'use client';

import { LineChart, RefreshCw } from 'lucide-react';

import { BackButton } from '@/components/shared/BackButton';
import { Button } from '@/components/ui/button';
import { PriceChart } from './components/PriceChart';
import { ProfitCard } from './components/ProfitCard';
import { SignalPanel } from './components/SignalPanel';
import { TimeRangeSelector } from './components/TimeRangeSelector';
import { useStockAnalysis } from './hooks/useStockAnalysis';

/**
 * 股票交易信号 Demo 页面
 * 金融交易终端场景 - 实时分析价格走势，计算最佳买卖时机
 */
export default function StockTradingSignalDemo() {
  const { prices, maData, analysisResult, tradeSignals, metrics, timeRange, changeTimeRange } =
    useStockAnalysis();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <BackButton fallbackHref="/problems/array" />
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/20">
                  <LineChart className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">股票交易信号</h1>
                  <p className="text-sm text-slate-400">
                    一次遍历 O(n) 计算最大利润 · MA 金叉死叉策略
                  </p>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              重新生成数据
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 左侧面板 */}
          <div className="space-y-6">
            <TimeRangeSelector
              currentRange={timeRange}
              onRangeChange={changeTimeRange}
              metrics={metrics}
            />
            <ProfitCard result={analysisResult} />
            <SignalPanel signals={tradeSignals} />
          </div>

          {/* 右侧图表 */}
          <div className="lg:col-span-3 space-y-6">
            <PriceChart prices={prices} maData={maData} analysisResult={analysisResult} />

            {/* 场景说明 */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
              <h3 className="text-lg font-bold mb-3">📈 业务场景</h3>
              <div className="text-sm text-slate-400 space-y-2">
                <p>
                  <strong className="text-white">金融交易终端</strong> -
                  量化分析师需要快速分析历史价格，寻找最佳买卖时机
                </p>
                <p>
                  <strong className="text-orange-400">核心算法</strong>: 一次遍历 O(n)
                  跟踪最小买入价，计算当前卖出利润
                </p>
                <p>
                  <strong className="text-cyan-400">技术指标</strong>: MA5/MA10 金叉死叉生成交易信号
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
