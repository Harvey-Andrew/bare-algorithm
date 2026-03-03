'use client';

import { BarChart3, RefreshCw } from 'lucide-react';

import { BackButton } from '@/components/shared/BackButton';
import { Button } from '@/components/ui/button';
import { PerformanceMetricsPanel } from './components/PerformanceMetrics';
import { RangeSelector } from './components/RangeSelector';
import { StatsPanel } from './components/StatsPanel';
import { TimeSeriesChart } from './components/TimeSeriesChart';
import { useChartAnalytics } from './hooks/useChartAnalytics';

/**
 * 图表埋点统计 Demo 页面
 */
export default function ChartAnalyticsDemo() {
  const {
    buckets,
    queryResult,
    selectedRange,
    metrics,
    isLoading,
    executeQuery,
    resetData,
    setSelectedRange,
  } = useChartAnalytics();

  const handleRangeChange = (start: number, end: number) => {
    setSelectedRange([start, end]);
  };

  const handleQuery = () => {
    executeQuery(selectedRange[0], selectedRange[1]);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400">加载数据中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <BackButton fallbackHref="/problems/array" />
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/20">
                  <BarChart3 className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">实时销售看板</h1>
                  <p className="text-sm text-slate-400">前缀和 O(1) 区间查询 · 差分数组批量更新</p>
                </div>
              </div>
            </div>
            <Button variant="outline" onClick={resetData} className="cursor-pointer">
              <RefreshCw className="w-4 h-4 mr-2" />
              重新生成数据
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 左侧控制面板 */}
          <div className="space-y-6">
            <RangeSelector
              selectedRange={selectedRange}
              maxIndex={buckets.length - 1}
              onRangeChange={handleRangeChange}
              onQuery={handleQuery}
            />
            <StatsPanel result={queryResult} />
            <PerformanceMetricsPanel metrics={metrics} />
          </div>

          {/* 右侧图表 */}
          <div className="lg:col-span-3">
            <TimeSeriesChart
              buckets={buckets}
              selectedRange={selectedRange}
              onRangeChange={handleRangeChange}
            />

            {/* 场景说明 */}
            <div className="mt-6 p-4 bg-slate-900 border border-slate-800 rounded-lg">
              <h3 className="text-lg font-bold mb-3">📊 业务场景</h3>
              <div className="text-sm text-slate-400 space-y-2">
                <p>
                  <strong className="text-white">电商实时销售看板</strong> -
                  运营人员需要快速查询任意时间段的销售数据汇总
                </p>
                <p>
                  <strong className="text-cyan-400">前缀和算法</strong>: 预处理 O(n)，查询 O(1) —
                  适合频繁的区间查询场景
                </p>
                <p>
                  <strong className="text-purple-400">差分数组</strong>: 更新 O(1)，还原 O(n) —
                  适合批量调整促销系数等场景
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
