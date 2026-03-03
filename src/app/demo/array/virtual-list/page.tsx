'use client';

import { List, RefreshCw } from 'lucide-react';

import { BackButton } from '@/components/shared/BackButton';
import { Button } from '@/components/ui/button';
import { ControlPanel } from './components/ControlPanel';
import { ScrollInfo } from './components/ScrollInfo';
import { VirtualListContainer } from './components/VirtualListContainer';
import { useVirtualList } from './hooks/useVirtualList';

/**
 * 虚拟列表 Demo 页面
 * 社交 App 消息列表场景 - 10 万条消息仅渲染可见区域
 */
export default function VirtualListDemo() {
  const {
    visibleItems,
    visibleRange,
    totalHeight,
    config,
    metrics,
    containerRef,
    handleScroll,
    scrollToTop,
    scrollToBottom,
    scrollToIndex,
  } = useVirtualList();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <BackButton fallbackHref="/problems/array" />
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <List className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">消息列表</h1>
                  <p className="text-sm text-slate-400">虚拟滚动 · 索引计算 O(1) · 切片 O(k)</p>
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
            <ControlPanel
              totalItems={metrics.totalItems}
              onScrollToTop={scrollToTop}
              onScrollToBottom={scrollToBottom}
              onScrollToIndex={scrollToIndex}
            />
            <ScrollInfo metrics={metrics} visibleRange={visibleRange} />
          </div>

          {/* 右侧列表 */}
          <div className="lg:col-span-3 space-y-6">
            <VirtualListContainer
              items={visibleItems}
              visibleRange={visibleRange}
              totalHeight={totalHeight}
              config={config}
              containerRef={containerRef}
              onScroll={handleScroll}
            />

            {/* 场景说明 */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
              <h3 className="text-lg font-bold mb-3">📱 业务场景</h3>
              <div className="text-sm text-slate-400 space-y-2">
                <p>
                  <strong className="text-white">社交 App 消息列表</strong> - 处理 10 万+
                  条消息的高性能渲染
                </p>
                <p>
                  <strong className="text-purple-400">核心原理</strong>: 根据 scrollTop
                  计算可见区域的 start/end 索引，只渲染可见项
                </p>
                <p>
                  <strong className="text-cyan-400">优化效果</strong>: 仅渲染约 0.02% 的 DOM
                  节点，保持 60 FPS 流畅滚动
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
