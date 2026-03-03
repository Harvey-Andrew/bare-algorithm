'use client';

import { Copy, RefreshCw, Trash2 } from 'lucide-react';

import { BackButton } from '@/components/shared/BackButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDeduplication } from './hooks/useDeduplication';

export default function DataDeduplicationDemo() {
  const { result, metrics, regenerate } = useDeduplication();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <BackButton fallbackHref="/problems/array" />
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-rose-500/20">
                  <Copy className="w-6 h-6 text-rose-400" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">数据去重/清洗</h1>
                  <p className="text-sm text-slate-400">O(n) 哈希去重</p>
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">统计</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-400">原始数据</span>
                <span className="text-white font-mono">{metrics.originalCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">去重后</span>
                <span className="text-green-400 font-mono">{metrics.uniqueCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">重复项</span>
                <span className="text-red-400 font-mono">{metrics.duplicateCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">耗时</span>
                <span className="text-cyan-400 font-mono">{metrics.dedupTime.toFixed(2)}ms</span>
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-3">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Trash2 className="w-5 h-5 text-red-400" />
                  发现的重复项（前 20 个）
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[400px] overflow-auto">
                  {result.duplicates.slice(0, 20).map((dup) => (
                    <div
                      key={dup.id}
                      className="px-3 py-2 bg-red-500/10 border border-red-500/30 rounded flex justify-between"
                    >
                      <span className="text-white">{dup.email}</span>
                      <span className="text-xs text-slate-500">{dup.source}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
