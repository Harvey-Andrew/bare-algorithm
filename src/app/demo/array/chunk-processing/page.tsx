'use client';

import { Layers, Pause, Play, RefreshCw } from 'lucide-react';

import { BackButton } from '@/components/shared/BackButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CONFIG } from './constants';
import { useChunkProcessing } from './hooks/useChunkProcessing';

export default function ChunkProcessingDemo() {
  const {
    state,
    metrics,
    results: _results,
    chunkSize,
    setChunkSize,
    startProcessing,
    pauseProcessing,
    resetProcessing,
  } = useChunkProcessing();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <BackButton fallbackHref="/problems/array" />
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/20">
                <Layers className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold">大数据分块处理</h1>
                <p className="text-sm text-slate-400">RAF 时间切片 · 不阻塞主线程</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">控制面板</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">分块大小</label>
                <div className="flex flex-wrap gap-1">
                  {CONFIG.CHUNK_SIZES.map((size) => (
                    <Button
                      key={size}
                      variant={chunkSize === size ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setChunkSize(size)}
                      className="cursor-pointer"
                      disabled={state.status === 'processing'}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                {state.status !== 'processing' ? (
                  <Button onClick={startProcessing} className="flex-1 cursor-pointer">
                    <Play className="w-4 h-4 mr-2" />
                    开始
                  </Button>
                ) : (
                  <Button
                    onClick={pauseProcessing}
                    variant="secondary"
                    className="flex-1 cursor-pointer"
                  >
                    <Pause className="w-4 h-4 mr-2" />
                    暂停
                  </Button>
                )}
                <Button onClick={resetProcessing} variant="outline" className="cursor-pointer">
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
              <div className="text-xs text-slate-500 space-y-1">
                <p>总数据: {state.totalCount.toLocaleString()}</p>
                <p>已处理: {state.processedCount.toLocaleString()}</p>
                <p>
                  当前块: {state.currentChunk}/{state.totalChunks}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-3 space-y-4">
            {/* 进度条 */}
            <Card className="bg-slate-900 border-slate-800 p-4">
              <div className="text-sm text-slate-400 mb-2">处理进度</div>
              <div className="h-4 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 transition-all"
                  style={{ width: `${state.progress * 100}%` }}
                />
              </div>
              <div className="text-right text-xs text-slate-500 mt-1">
                {(state.progress * 100).toFixed(1)}%
              </div>
            </Card>

            {/* 性能指标 */}
            {state.status === 'completed' && (
              <Card className="bg-slate-900 border-slate-800 p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-indigo-400">
                      {metrics.totalTime.toFixed(0)}ms
                    </div>
                    <div className="text-xs text-slate-500">总耗时</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-cyan-400">
                      {metrics.avgChunkTime.toFixed(2)}ms
                    </div>
                    <div className="text-xs text-slate-500">平均每块</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-400">
                      {(metrics.itemsPerSecond / 1000).toFixed(1)}k
                    </div>
                    <div className="text-xs text-slate-500">条/秒</div>
                  </div>
                </div>
              </Card>
            )}

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
              <h3 className="text-lg font-bold mb-3">📦 业务场景</h3>
              <div className="text-sm text-slate-400 space-y-2">
                <p>
                  <strong className="text-white">大文件上传/导入</strong> - 分块处理避免阻塞 UI
                </p>
                <p>
                  <strong className="text-indigo-400">requestAnimationFrame</strong>:
                  每帧处理一块，保持 60 FPS
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
