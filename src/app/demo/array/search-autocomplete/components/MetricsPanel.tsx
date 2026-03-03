'use client';

import { Activity, Clock, Database, Zap } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { PerformanceMetrics } from '../types';

interface MetricsPanelProps {
  metrics: PerformanceMetrics;
}

/**
 * 性能指标面板组件
 */
export function MetricsPanel({ metrics }: MetricsPanelProps) {
  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-lg flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          性能指标
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
          <div className="flex items-center gap-2 text-slate-400">
            <Database className="w-4 h-4" />
            <span className="text-sm">关键词总数</span>
          </div>
          <span className="text-white font-mono">{metrics.totalKeywords.toLocaleString()}</span>
        </div>

        <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
          <div className="flex items-center gap-2 text-slate-400">
            <Clock className="w-4 h-4" />
            <span className="text-sm">索引构建</span>
          </div>
          <span className="text-green-400 font-mono">{metrics.indexBuildTime.toFixed(2)}ms</span>
        </div>

        <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
          <div className="flex items-center gap-2 text-slate-400">
            <Zap className="w-4 h-4" />
            <span className="text-sm">搜索耗时</span>
          </div>
          <span className="text-cyan-400 font-mono">{metrics.searchTime.toFixed(3)}ms</span>
        </div>

        <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="text-sm">匹配数量</span>
          </div>
          <span className="text-white font-mono">{metrics.matchCount}</span>
        </div>

        <div className="text-xs text-slate-500 pt-2 border-t border-slate-800">
          <p>• 前缀索引：O(1) 哈希查找</p>
          <p>• 模糊搜索：O(n) 遍历</p>
          <p>• 热度排序：O(k log k)</p>
        </div>
      </CardContent>
    </Card>
  );
}
