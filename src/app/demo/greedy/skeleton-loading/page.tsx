'use client';

import { useEffect, useState } from 'react';
import { Layers } from 'lucide-react';

import { BackButton } from '@/components/shared/BackButton';

interface Block {
  id: string;
  name: string;
  priority: number;
  loaded: boolean;
}

const BLOCKS: Block[] = [
  { id: 'hero', name: 'Hero Banner', priority: 10, loaded: false },
  { id: 'nav', name: 'Navigation', priority: 9, loaded: false },
  { id: 'main', name: 'Main Content', priority: 8, loaded: false },
  { id: 'sidebar', name: 'Sidebar', priority: 5, loaded: false },
  { id: 'comments', name: 'Comments', priority: 3, loaded: false },
  { id: 'footer', name: 'Footer', priority: 2, loaded: false },
];

export default function SkeletonLoadingDemo() {
  const [blocks, setBlocks] = useState<Block[]>(
    [...BLOCKS].sort((a, b) => b.priority - a.priority)
  );

  useEffect(() => {
    let idx = 0;
    const timer = setInterval(() => {
      if (idx >= blocks.length) {
        clearInterval(timer);
        return;
      }
      setBlocks((prev) => prev.map((b, i) => (i === idx ? { ...b, loaded: true } : b)));
      idx++;
    }, 500);
    return () => clearInterval(timer);
  }, [blocks.length]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <BackButton fallbackHref="/problems/greedy" />
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Layers className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold">内容流/骨架屏</h1>
                <p className="text-sm text-slate-400">启发式贪心优先渲染</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-xl">
        <div className="space-y-3">
          {blocks.map((b) => (
            <div
              key={b.id}
              className={`p-6 rounded-lg transition-all duration-500
                ${b.loaded ? 'bg-emerald-500/20 border border-emerald-500' : 'bg-slate-700 animate-pulse'}`}
            >
              <div className="flex items-center justify-between">
                <span className={b.loaded ? '' : 'opacity-50'}>{b.name}</span>
                <span className="text-xs text-slate-400">优先级: {b.priority}</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
