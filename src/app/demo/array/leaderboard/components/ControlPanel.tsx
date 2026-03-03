'use client';

import { Activity, Pause, Play, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { PerformanceMetrics, TopKParams } from '../types';

interface ControlPanelProps {
  params: TopKParams;
  metrics: PerformanceMetrics;
  algorithmName: string;
  autoUpdate: boolean;
  onAlgorithmChange: (algorithm: TopKParams['algorithm']) => void;
  onKChange: (k: number) => void;
  onToggleAutoUpdate: () => void;
  onRegenerate: () => void;
}

const K_OPTIONS = [10, 50, 100, 200, 500];
const ALGORITHMS: { value: TopKParams['algorithm']; label: string }[] = [
  { value: 'sort', label: '完整排序' },
  { value: 'quickSelect', label: '快速选择' },
  { value: 'heap', label: '最小堆' },
];

/**
 * 控制面板组件
 */
export function ControlPanel({
  params,
  metrics,
  algorithmName,
  autoUpdate,
  onAlgorithmChange,
  onKChange,
  onToggleAutoUpdate,
  onRegenerate,
}: ControlPanelProps) {
  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-lg flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          控制面板
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Top-K 选择 */}
        <div>
          <label className="block text-sm text-slate-400 mb-2">显示 Top-K</label>
          <div className="flex flex-wrap gap-1">
            {K_OPTIONS.map((k) => (
              <Button
                key={k}
                variant={params.k === k ? 'default' : 'outline'}
                size="sm"
                onClick={() => onKChange(k)}
                className="cursor-pointer"
              >
                {k}
              </Button>
            ))}
          </div>
        </div>

        {/* 算法选择 */}
        <div>
          <label className="block text-sm text-slate-400 mb-2">算法</label>
          <div className="space-y-1">
            {ALGORITHMS.map((algo) => (
              <Button
                key={algo.value}
                variant={params.algorithm === algo.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => onAlgorithmChange(algo.value)}
                className="w-full cursor-pointer justify-start"
              >
                {algo.label}
              </Button>
            ))}
          </div>
        </div>

        {/* 自动更新 */}
        <Button
          variant={autoUpdate ? 'default' : 'outline'}
          onClick={onToggleAutoUpdate}
          className="w-full cursor-pointer"
        >
          {autoUpdate ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
          {autoUpdate ? '暂停实时更新' : '开启实时更新'}
        </Button>

        {/* 重新生成 */}
        <Button variant="outline" onClick={onRegenerate} className="w-full cursor-pointer">
          <RefreshCw className="w-4 h-4 mr-2" />
          重新生成数据
        </Button>

        {/* 性能指标 */}
        <div className="pt-3 border-t border-slate-800">
          <div className="text-sm text-slate-400 mb-2">性能指标</div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">数据规模</span>
              <span className="text-white font-mono">{metrics.totalPlayers.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">显示数量</span>
              <span className="text-white font-mono">{metrics.displayCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">查询耗时</span>
              <span className="text-green-400 font-mono">{metrics.topKTime.toFixed(2)}ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">算法</span>
              <span className="text-cyan-400">{algorithmName}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
