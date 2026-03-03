'use client';

import { List } from 'lucide-react';

import { BackButton } from '@/components/shared/BackButton';
import { useVirtualList } from './hooks/useVirtualList';

export default function VirtualListVariableHeightDemo() {
  const { visibleItems, visibleRange, scrollTop, totalHeight, viewportHeight, handleScroll } =
    useVirtualList();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <BackButton fallbackHref="/problems/binary-search" />
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <List className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold">变高虚拟列表定位</h1>
                <p className="text-sm text-slate-400">二分查找定位起始渲染索引</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 虚拟列表 */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <h3 className="font-semibold mb-4">虚拟列表 (1000 项)</h3>
              <div
                className="overflow-auto rounded-lg bg-slate-900"
                style={{ height: viewportHeight }}
                onScroll={(e) => handleScroll(e.currentTarget.scrollTop)}
              >
                <div style={{ height: totalHeight, position: 'relative' }}>
                  {visibleItems.map((item) => (
                    <div
                      key={item.id}
                      className="absolute left-0 right-0 px-4 border-b border-slate-700 flex items-center"
                      style={{
                        top:
                          visibleRange.offset +
                          visibleItems
                            .slice(0, visibleItems.indexOf(item))
                            .reduce((sum, i) => sum + i.height, 0),
                        height: item.height,
                      }}
                    >
                      <span className="text-xs text-slate-500 w-12">#{item.id}</span>
                      <span className="flex-1">{item.content}</span>
                      <span className="text-xs text-slate-500">{item.height}px</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 统计信息 */}
          <div className="space-y-4">
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <h3 className="font-semibold mb-4">渲染状态</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">scrollTop</span>
                  <span className="font-mono text-emerald-400">{Math.round(scrollTop)}px</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">起始索引</span>
                  <span className="font-mono text-blue-400">{visibleRange.startIndex}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">结束索引</span>
                  <span className="font-mono text-blue-400">{visibleRange.endIndex}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">渲染数量</span>
                  <span className="font-mono text-amber-400">{visibleItems.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">总高度</span>
                  <span className="font-mono">{totalHeight}px</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <h3 className="font-semibold mb-3">算法说明</h3>
              <div className="text-sm text-slate-300 space-y-2">
                <p>
                  使用<strong>二分查找</strong>在累积高度数组中定位起始索引。
                </p>
                <p className="text-xs text-slate-500">时间复杂度: O(log n) vs 线性 O(n)</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
