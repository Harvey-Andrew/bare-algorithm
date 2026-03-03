'use client';

import { Database, Search } from 'lucide-react';

import { BackButton } from '@/components/shared/BackButton';
import { useSortedDataRetrieval } from './hooks/useSortedDataRetrieval';

export default function SortedDataRetrievalDemo() {
  const { searchValue, setSearchValue, binaryResult, linearResult, search, maxValue } =
    useSortedDataRetrieval();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <BackButton fallbackHref="/problems/binary-search" />
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/20">
                <Database className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold">有序数据检索</h1>
                <p className="text-sm text-slate-400">二分 vs 线性查找对比</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* 搜索面板 */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <h3 className="font-semibold mb-4">搜索有序数据 (1000 条)</h3>
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <label className="text-sm text-slate-400 block mb-2">搜索值: {searchValue}</label>
                <input
                  type="range"
                  min={0}
                  max={maxValue}
                  value={searchValue}
                  onChange={(e) => setSearchValue(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              <button
                onClick={search}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-lg
                  flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Search className="w-5 h-5" />
                搜索
              </button>
            </div>
          </div>

          {/* 结果对比 */}
          {binaryResult && linearResult && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-500/20 rounded-xl p-4 border border-emerald-500">
                <h4 className="font-semibold text-emerald-400 mb-3">二分查找</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">比较次数</span>
                    <span className="font-mono text-2xl font-bold text-emerald-400">
                      {binaryResult.comparisons}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">结果</span>
                    <span>{binaryResult.item ? `找到: ${binaryResult.item.name}` : '未找到'}</span>
                  </div>
                  <div className="text-xs text-slate-500">时间复杂度: O(log n)</div>
                </div>
              </div>

              <div className="bg-amber-500/20 rounded-xl p-4 border border-amber-500">
                <h4 className="font-semibold text-amber-400 mb-3">线性查找</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">比较次数</span>
                    <span className="font-mono text-2xl font-bold text-amber-400">
                      {linearResult.comparisons}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">结果</span>
                    <span>{linearResult.item ? `找到: ${linearResult.item.name}` : '未找到'}</span>
                  </div>
                  <div className="text-xs text-slate-500">时间复杂度: O(n)</div>
                </div>
              </div>
            </div>
          )}

          {binaryResult && linearResult && (
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 text-center">
              <span className="text-slate-400">效率提升: </span>
              <span className="text-2xl font-bold text-emerald-400">
                {(linearResult.comparisons / binaryResult.comparisons).toFixed(1)}x
              </span>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
