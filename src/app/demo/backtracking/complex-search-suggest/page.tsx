'use client';

import { File, Folder, Search } from 'lucide-react';

import { BackButton } from '@/components/shared/BackButton';
import { useComplexSearch } from './hooks/useComplexSearch';

export default function ComplexSearchSuggestDemo() {
  const { query, suggestions, handleSearch, paths } = useComplexSearch();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <BackButton fallbackHref="/problems/backtracking" />
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Search className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold">复杂搜索建议</h1>
                <p className="text-sm text-slate-400">回溯算法实现代码补全</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* 搜索框 */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="输入文件路径搜索..."
              className="w-full pl-12 pr-4 py-4 bg-slate-800 border border-slate-700
                rounded-xl focus:border-blue-500 outline-none text-lg"
            />
          </div>

          {/* 搜索建议 */}
          {suggestions.length > 0 && (
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 mb-6 overflow-hidden">
              {suggestions.map((sug) => (
                <div
                  key={sug.id}
                  className="p-4 border-b border-slate-700 last:border-0 flex items-center gap-3
                    hover:bg-slate-700/50 cursor-pointer transition-colors"
                >
                  {sug.type === 'file' ? (
                    <File className="w-5 h-5 text-blue-400" />
                  ) : (
                    <Folder className="w-5 h-5 text-amber-400" />
                  )}
                  <span className="font-mono text-sm">{sug.text}</span>
                </div>
              ))}
            </div>
          )}

          {/* 所有路径 */}
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <h3 className="font-semibold mb-4">可搜索路径</h3>
            <div className="space-y-2">
              {paths.map((p) => (
                <div key={p} className="flex items-center gap-2 text-sm text-slate-400">
                  <File className="w-4 h-4" />
                  <span className="font-mono">{p}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
