'use client';

import { useEffect, useMemo, useState } from 'react';
import { Columns, Link2 } from 'lucide-react';

import { BackButton } from '@/components/shared/BackButton';

const COLUMNS = ['ID', '姓名', '邮箱', '电话', '地址', '部门', '职位', '入职日期'];

export default function StateCompressionDemo() {
  const [state, setState] = useState(0b11110011);

  const visibleColumns = useMemo(() => COLUMNS.filter((_, i) => (state & (1 << i)) !== 0), [state]);

  const toggle = (index: number) => setState((prev) => prev ^ (1 << index));

  const urlParam = useMemo(() => `?cols=${state.toString(16)}`, [state]);

  useEffect(() => {
    window.history.replaceState(null, '', urlParam);
  }, [urlParam]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <BackButton fallbackHref="/problems/bit-manipulation" />
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Columns className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold">状态压缩</h1>
                <p className="text-sm text-slate-400">列显隐状态存储</p>
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Link2 className="w-4 h-4" />
            <span className="text-slate-400">URL 参数:</span>
            <code className="bg-slate-700 px-2 py-1 rounded text-emerald-400">{urlParam}</code>
          </div>
          <div className="flex flex-wrap gap-2">
            {COLUMNS.map((col, i) => (
              <button
                key={col}
                onClick={() => toggle(i)}
                className={`px-3 py-2 rounded cursor-pointer transition-colors
                  ${(state & (1 << i)) !== 0 ? 'bg-emerald-500 text-black' : 'bg-slate-700'}`}
              >
                {col}
              </button>
            ))}
          </div>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                {visibleColumns.map((c) => (
                  <th key={c} className="text-left p-2 border-b border-slate-700">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3].map((row) => (
                <tr key={row}>
                  {visibleColumns.map((c) => (
                    <td key={c} className="p-2 border-b border-slate-700/50">
                      数据 {row}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
