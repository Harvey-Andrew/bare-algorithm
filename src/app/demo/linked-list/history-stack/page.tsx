'use client';

import { useState } from 'react';
import { Redo2, RotateCcw, Undo2 } from 'lucide-react';

import { BackButton } from '@/components/shared/BackButton';
import { HistoryTimeline } from './components/HistoryTimeline';
import { useHistoryStack } from './hooks/useHistoryStack';

export default function HistoryStackDemo() {
  const { history, currentIndex, currentContent, push, undo, redo, canUndo, canRedo } =
    useHistoryStack();
  const [inputValue, setInputValue] = useState(currentContent);

  const handleSave = () => {
    if (inputValue !== currentContent) {
      push(inputValue);
    }
  };

  const handleUndo = () => {
    undo();
    setInputValue(history[currentIndex - 1]?.content ?? '');
  };

  const handleRedo = () => {
    redo();
    setInputValue(history[currentIndex + 1]?.content ?? '');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <BackButton fallbackHref="/problems/linked-list" />
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <RotateCcw className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Undo/Redo 历史记录</h1>
                <p className="text-sm text-slate-400">使用双向链表实现撤销/重做功能</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {/* 编辑器 */}
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">文本编辑器</h3>
                <div className="flex gap-2">
                  <button
                    onClick={handleUndo}
                    disabled={!canUndo}
                    className="p-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-30
                      rounded-lg transition-colors cursor-pointer"
                  >
                    <Undo2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleRedo}
                    disabled={!canRedo}
                    className="p-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-30
                      rounded-lg transition-colors cursor-pointer"
                  >
                    <Redo2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onBlur={handleSave}
                className="w-full h-48 p-3 bg-slate-900 rounded-lg border border-slate-700
                  focus:border-emerald-500 outline-none resize-none"
                placeholder="输入文本..."
              />
              <div className="mt-2 text-xs text-slate-500">
                失去焦点自动保存 · 快捷键: Ctrl+Z 撤销, Ctrl+Y 重做
              </div>
            </div>
          </div>

          <HistoryTimeline history={history} currentIndex={currentIndex} />
        </div>
      </main>
    </div>
  );
}
