'use client';

import { useCallback, useState } from 'react';
import { Search } from 'lucide-react';

import { BackButton } from '@/components/shared/BackButton';

const PERMISSIONS = new Set(['read', 'write', 'delete', 'admin', 'export']);
const FEATURES = new Set(['dark-mode', 'beta-ui', 'new-editor', 'analytics']);

export default function DeduplicationLookupDemo() {
  const [input, setInput] = useState('');
  const [checkedItems, setCheckedItems] = useState<string[]>([]);

  const checkItem = useCallback(() => {
    if (!input.trim()) return;
    const exists = PERMISSIONS.has(input) || FEATURES.has(input);
    setCheckedItems((prev) => [...prev, `${input}: ${exists ? '✓' : '✗'}`]);
    setInput('');
  }, [input]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <BackButton fallbackHref="/problems/hash-table" />
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Search className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold">去重与快速查找</h1>
                <p className="text-sm text-slate-400">O(1) Set 查找</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-xl">
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 mb-4">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && checkItem()}
              placeholder="输入权限或功能名称..."
              className="flex-1 px-4 py-2 bg-slate-700 rounded-lg border border-slate-600"
            />
            <button
              onClick={checkItem}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg cursor-pointer"
            >
              检查
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <h3 className="font-semibold mb-2">权限集合</h3>
            <div className="flex flex-wrap gap-1">
              {[...PERMISSIONS].map((p) => (
                <span key={p} className="px-2 py-1 bg-blue-500/20 rounded text-xs">
                  {p}
                </span>
              ))}
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <h3 className="font-semibold mb-2">功能开关</h3>
            <div className="flex flex-wrap gap-1">
              {[...FEATURES].map((f) => (
                <span key={f} className="px-2 py-1 bg-purple-500/20 rounded text-xs">
                  {f}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <h3 className="font-semibold mb-2">查找记录</h3>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {checkedItems.map((item, i) => (
              <div key={i} className="text-sm font-mono">
                {item}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
