'use client';

import { Search } from 'lucide-react';

import { BackButton } from '@/components/shared/BackButton';
import { HotTags } from './components/HotTags';
import { MetricsPanel } from './components/MetricsPanel';
import { SearchInput } from './components/SearchInput';
import { SuggestionList } from './components/SuggestionList';
import { useAutocomplete } from './hooks/useAutocomplete';

/**
 * 搜索/自动补全 Demo 页面
 * 电商搜索框场景 - 前缀索引 O(1) 查找、热度排序
 */
export default function SearchAutocompleteDemo() {
  const { suggestions, metrics, query, updateQuery, clearSearch } = useAutocomplete();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <BackButton fallbackHref="/problems/array" />
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-pink-500/20">
                <Search className="w-6 h-6 text-pink-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold">搜索自动补全</h1>
                <p className="text-sm text-slate-400">前缀索引 O(1) · 热度排序 · 模糊匹配</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 左侧性能面板 */}
          <div>
            <MetricsPanel metrics={metrics} />
          </div>

          {/* 右侧搜索区 */}
          <div className="lg:col-span-3">
            <div className="max-w-2xl mx-auto">
              <SearchInput query={query} onQueryChange={updateQuery} onClear={clearSearch} />

              <SuggestionList suggestions={suggestions} onSelect={updateQuery} />

              {!query && <HotTags onSelect={updateQuery} />}
            </div>

            {/* 场景说明 */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg mt-8 max-w-2xl mx-auto">
              <h3 className="text-lg font-bold mb-3">🔍 业务场景</h3>
              <div className="text-sm text-slate-400 space-y-2">
                <p>
                  <strong className="text-white">电商搜索框</strong> - 从 50,000+
                  关键词中实时过滤候选项
                </p>
                <p>
                  <strong className="text-pink-400">前缀索引</strong>: 预处理构建哈希表，查询 O(1)
                </p>
                <p>
                  <strong className="text-cyan-400">热度排序</strong>: 取 Top-K 热门结果
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
