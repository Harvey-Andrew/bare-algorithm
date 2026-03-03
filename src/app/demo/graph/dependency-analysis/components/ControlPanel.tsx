'use client';

import { GitBranch, Loader2, Package, Plus, RefreshCw, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Dependency, Module } from '../types';

interface ControlPanelProps {
  modules: Module[];
  deps: Dependency[];
  isAnalyzing: boolean;
  newDepFrom: string;
  newDepTo: string;
  onNewDepFromChange: (value: string) => void;
  onNewDepToChange: (value: string) => void;
  onAddDep: () => void;
  onRemoveDep: (from: string, to: string) => void;
  onRunAnalysis: () => void;
  onReset: () => void;
}

/**
 * 控制面板组件
 */
export function ControlPanel({
  modules,
  deps,
  isAnalyzing,
  newDepFrom,
  newDepTo,
  onNewDepFromChange,
  onNewDepToChange,
  onAddDep,
  onRemoveDep,
  onRunAnalysis,
  onReset,
}: ControlPanelProps) {
  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Package className="w-5 h-5" /> 依赖管理
        </CardTitle>
        <CardDescription>添加或删除模块依赖关系</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 添加依赖 */}
        <div className="space-y-2">
          <label className="text-sm text-slate-400">添加依赖</label>
          <div className="flex gap-2">
            <select
              className="flex-1 bg-slate-800 border-slate-700 rounded px-2 py-1 text-sm cursor-pointer hover:bg-slate-700 transition-colors"
              value={newDepFrom}
              onChange={(e) => onNewDepFromChange(e.target.value)}
            >
              <option value="">选择模块</option>
              {modules.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
            <span className="text-slate-500">→</span>
            <select
              className="flex-1 bg-slate-800 border-slate-700 rounded px-2 py-1 text-sm cursor-pointer hover:bg-slate-700 transition-colors"
              value={newDepTo}
              onChange={(e) => onNewDepToChange(e.target.value)}
            >
              <option value="">选择模块</option>
              {modules.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
            <Button size="sm" variant="secondary" onClick={onAddDep} className="cursor-pointer">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* 依赖列表 */}
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {deps.map((d, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-2 bg-slate-800 rounded text-sm hover:bg-slate-700/50 transition-colors"
            >
              <span>
                {modules.find((m) => m.id === d.from)?.name} →{' '}
                {modules.find((m) => m.id === d.to)?.name}
              </span>
              <button
                onClick={() => onRemoveDep(d.from, d.to)}
                className="text-red-400 hover:text-red-300 cursor-pointer p-1 rounded hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-2">
          <Button className="flex-1 cursor-pointer" onClick={onRunAnalysis} disabled={isAnalyzing}>
            {isAnalyzing ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <GitBranch className="w-4 h-4 mr-2" />
            )}
            分析依赖
          </Button>
          <Button variant="outline" onClick={onReset} className="cursor-pointer">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
