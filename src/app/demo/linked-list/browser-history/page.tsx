'use client';

import { ChevronLeft, ChevronRight, Globe } from 'lucide-react';

import { BackButton } from '@/components/shared/BackButton';
import { AVAILABLE_PAGES } from './constants';
import { useBrowserHistory } from './hooks/useBrowserHistory';

export default function BrowserHistoryDemo() {
  const { history, currentIndex, currentPage, goBack, goForward, visit, canGoBack, canGoForward } =
    useBrowserHistory();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <BackButton fallbackHref="/problems/linked-list" />
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/20">
                <Globe className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold">浏览器历史</h1>
                <p className="text-sm text-slate-400">双向链表实现前进/后退</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* 模拟浏览器 */}
        <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 max-w-2xl mx-auto mb-8">
          {/* 工具栏 */}
          <div className="flex items-center gap-2 p-3 bg-slate-900 border-b border-slate-700">
            <button
              onClick={goBack}
              disabled={!canGoBack}
              className="p-2 hover:bg-slate-700 disabled:opacity-30 rounded transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goForward}
              disabled={!canGoForward}
              className="p-2 hover:bg-slate-700 disabled:opacity-30 rounded transition-colors cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="flex-1 bg-slate-800 rounded px-4 py-2 text-sm text-slate-400">
              {currentPage?.url}
            </div>
          </div>
          {/* 页面内容 */}
          <div className="p-8 text-center">
            <Globe className="w-16 h-16 mx-auto text-cyan-400 mb-4" />
            <h2 className="text-2xl font-bold">{currentPage?.title}</h2>
            <p className="text-slate-400 mt-2">{currentPage?.url}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 导航链接 */}
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <h3 className="font-semibold mb-4">访问页面</h3>
            <div className="grid grid-cols-2 gap-2">
              {AVAILABLE_PAGES.map((page) => (
                <button
                  key={page.id}
                  onClick={() => visit(page)}
                  className="p-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-left transition-colors cursor-pointer"
                >
                  <div className="font-medium">{page.title}</div>
                  <div className="text-xs text-slate-400 truncate">{page.url}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 历史记录 */}
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <h3 className="font-semibold mb-4">历史栈</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {history.map((page, idx) => (
                <div
                  key={page.id}
                  className={`p-3 rounded-lg ${idx === currentIndex ? 'bg-cyan-500/20 border border-cyan-500' : 'bg-slate-700/50'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{page.title}</span>
                    {idx === currentIndex && (
                      <span className="text-xs bg-cyan-500 text-black px-2 py-0.5 rounded">
                        当前
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
