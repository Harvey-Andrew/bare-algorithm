'use client';

import { useMemo, useState } from 'react';
import { BookOpen, Search } from 'lucide-react';

import { BackButton } from '@/components/shared/BackButton';

const DOCS = [
  { id: 1, title: 'React Hooks 入门', content: 'React Hooks 让你在函数组件中使用状态' },
  { id: 2, title: 'TypeScript 类型系统', content: 'TypeScript 提供强大的类型检查' },
  { id: 3, title: 'React 性能优化', content: 'React 性能优化技巧和最佳实践' },
  { id: 4, title: 'CSS Grid 布局', content: 'CSS Grid 是现代布局解决方案' },
];

function buildIndex(docs: typeof DOCS): Map<string, number[]> {
  const index = new Map<string, number[]>();
  for (const doc of docs) {
    const words = (doc.title + ' ' + doc.content).split(/[\s,，。]+/);
    for (const word of words) {
      if (word.length < 2) continue;
      const ids = index.get(word) || [];
      if (!ids.includes(doc.id)) ids.push(doc.id);
      index.set(word, ids);
    }
  }
  return index;
}

export default function InvertedIndexDemo() {
  const index = useMemo(() => buildIndex(DOCS), []);
  const [query, setQuery] = useState('React');
  const results = useMemo(() => index.get(query) || [], [index, query]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <BackButton fallbackHref="/problems/hash-table" />
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/20">
                <BookOpen className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold">反向索引</h1>
                <p className="text-sm text-slate-400">Token → DocIDs 映射</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-xl">
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 mb-4">
          <div className="flex gap-2">
            <Search className="w-5 h-5 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索关键词..."
              className="flex-1 bg-transparent outline-none"
            />
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 mb-4">
          <h3 className="font-semibold mb-3">搜索结果 ({results.length})</h3>
          {results.length === 0 ? (
            <div className="text-slate-500">无匹配文档</div>
          ) : (
            <div className="space-y-2">
              {results.map((id) => {
                const doc = DOCS.find((d) => d.id === id)!;
                return (
                  <div key={id} className="p-3 bg-cyan-500/20 rounded">
                    <div className="font-semibold">{doc.title}</div>
                    <div className="text-sm text-slate-300">{doc.content}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <h3 className="font-semibold mb-2">索引结构</h3>
          <div className="text-xs text-slate-400 font-mono max-h-32 overflow-y-auto">
            {[...index.entries()].slice(0, 10).map(([k, v]) => (
              <div key={k}>
                {k}: [{v.join(', ')}]
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
