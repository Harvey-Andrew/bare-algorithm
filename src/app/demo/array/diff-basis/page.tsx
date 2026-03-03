'use client';

import { GitCompare, Minus, Plus, RefreshCw } from 'lucide-react';

import { BackButton } from '@/components/shared/BackButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDiff } from './hooks/useDiff';
import type { Item } from './types';

function ItemList({
  items,
  type,
}: {
  items: Item[];
  type: 'added' | 'removed' | 'unchanged' | 'old' | 'new';
}) {
  const colors = {
    added: 'bg-green-500/20 border-green-500/50',
    removed: 'bg-red-500/20 border-red-500/50',
    unchanged: 'bg-slate-800 border-slate-700',
    old: 'bg-slate-800 border-slate-700',
    new: 'bg-slate-800 border-slate-700',
  };

  return (
    <div className="space-y-1">
      {items.map((item) => (
        <div
          key={item.id}
          className={`px-3 py-2 rounded border ${colors[type]} flex items-center justify-between`}
        >
          <span className="text-white text-sm">{item.name}</span>
          <span className="text-xs text-slate-500">{item.id}</span>
        </div>
      ))}
    </div>
  );
}

export default function DiffBasisDemo() {
  const { oldList, newList, result, metrics, regenerate } = useDiff();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <BackButton fallbackHref="/problems/array" />
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/20">
                  <GitCompare className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Diff 基础</h1>
                  <p className="text-sm text-slate-400">列表差异计算 · O(n) 哈希</p>
                </div>
              </div>
            </div>
            <Button variant="outline" onClick={regenerate} className="cursor-pointer">
              <RefreshCw className="w-4 h-4 mr-2" />
              重新生成
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">旧列表 ({oldList.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <ItemList items={oldList} type="old" />
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">新列表 ({newList.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <ItemList items={newList} type="new" />
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Diff 结果</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center gap-2 text-green-400 mb-2">
                  <Plus className="w-4 h-4" />
                  新增 ({result.added.length})
                </div>
                <ItemList items={result.added} type="added" />
              </div>
              <div>
                <div className="flex items-center gap-2 text-red-400 mb-2">
                  <Minus className="w-4 h-4" />
                  删除 ({result.removed.length})
                </div>
                <ItemList items={result.removed} type="removed" />
              </div>
              <div className="text-xs text-slate-500 pt-2 border-t border-slate-800">
                <p>未变: {result.unchanged.length} 项</p>
                <p>耗时: {metrics.diffTime.toFixed(3)}ms</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
