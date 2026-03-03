'use client';

import { Activity, Minus, Pause, Play, TrendingDown, TrendingUp } from 'lucide-react';

import { BackButton } from '@/components/shared/BackButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useRealtimeDashboard } from './hooks/useRealtimeDashboard';
import type { MetricData } from './types';

function MetricCard({ metric }: { metric: MetricData }) {
  const TrendIcon =
    metric.trend === 'up' ? TrendingUp : metric.trend === 'down' ? TrendingDown : Minus;
  const trendColor =
    metric.trend === 'up'
      ? 'text-green-400'
      : metric.trend === 'down'
        ? 'text-red-400'
        : 'text-slate-400';

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm text-slate-400">{metric.name}</div>
            <div className="text-2xl font-bold text-white mt-1">
              {metric.unit === '¥' && '¥'}
              {metric.value.toLocaleString()}
              {metric.unit === '%' && '%'}
            </div>
          </div>
          <TrendIcon className={`w-5 h-5 ${trendColor}`} />
        </div>
        {/* Mini chart */}
        {metric.history.length > 1 && (
          <div className="mt-3 h-8 flex items-end gap-0.5">
            {metric.history.slice(-10).map((v, i) => {
              const max = Math.max(...metric.history);
              const height = max > 0 ? (v / max) * 100 : 0;
              return (
                <div
                  key={i}
                  className="flex-1 bg-cyan-500/50 rounded-t"
                  style={{ height: `${Math.max(10, height)}%` }}
                />
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function RealtimeDashboardDemo() {
  const {
    metrics,
    isLive,
    lastUpdateTime: _lastUpdateTime,
    performanceMetrics,
    toggleLive,
  } = useRealtimeDashboard();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <BackButton fallbackHref="/problems/array" />
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/20">
                  <Activity className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">实时仪表盘</h1>
                  <p className="text-sm text-slate-400">数组滑动窗口 · 增量更新</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-xs text-slate-500">
                更新: {performanceMetrics.updateCount} 次 | 平均:{' '}
                {performanceMetrics.avgUpdateTime.toFixed(2)}ms
              </div>
              <Button variant="outline" onClick={toggleLive} className="cursor-pointer">
                {isLive ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                {isLive ? '暂停' : '开始'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map((m) => (
            <MetricCard key={m.id} metric={m} />
          ))}
        </div>

        <div className="mt-6 p-4 bg-slate-900 border border-slate-800 rounded-lg">
          <h3 className="text-lg font-bold mb-3">📊 业务场景</h3>
          <div className="text-sm text-slate-400 space-y-2">
            <p>
              <strong className="text-white">运营实时看板</strong> - 电商/SaaS 核心业务指标监控
            </p>
            <p>
              <strong className="text-emerald-400">滑动窗口</strong>: 保留最近 N
              条历史数据，用于趋势图
            </p>
            <p>
              <strong className="text-cyan-400">增量更新</strong>: 不重建整个数组，使用 slice
              保持固定长度
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
