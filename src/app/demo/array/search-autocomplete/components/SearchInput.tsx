'use client';

import { Search, X } from 'lucide-react';

interface SearchInputProps {
  query: string;
  onQueryChange: (query: string) => void;
  onClear: () => void;
}

/**
 * 搜索输入框组件
 */
export function SearchInput({ query, onQueryChange, onClear }: SearchInputProps) {
  return (
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2">
        <Search className="w-5 h-5 text-slate-400" />
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="搜索商品..."
        autoFocus
        className="w-full h-14 pl-12 pr-12 bg-slate-900 border border-slate-700 rounded-xl text-white text-lg focus:outline-none focus:border-cyan-500 transition-colors"
      />
      {query && (
        <button
          onClick={onClear}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5 text-slate-400" />
        </button>
      )}
    </div>
  );
}
