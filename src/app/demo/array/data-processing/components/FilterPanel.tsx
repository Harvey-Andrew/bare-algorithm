'use client';

import { useState } from 'react';
import { Search, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { CATEGORIES, STATUS_OPTIONS } from '../constants';
import type { FilterConfig } from '../types';

interface FilterPanelProps {
  filter: FilterConfig;
  onFilterChange: (filter: Partial<FilterConfig>) => void;
  onClear: () => void;
}

/**
 * 筛选控制面板
 */
export function FilterPanel({ filter, onFilterChange, onClear }: FilterPanelProps) {
  const [keyword, setKeyword] = useState(filter.keyword || '');

  const handleKeywordSubmit = () => {
    onFilterChange({ keyword: keyword.trim() || undefined });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleKeywordSubmit();
    }
  };

  const hasFilter =
    filter.category || filter.status || filter.keyword || filter.minPrice || filter.maxPrice;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">筛选条件</h3>
        {hasFilter && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4 mr-1" />
            清除
          </Button>
        )}
      </div>

      {/* 关键词搜索 */}
      <div>
        <label className="block text-sm text-slate-400 mb-1">关键词</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="搜索商品名/SKU"
            className="flex-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded text-white text-sm focus:outline-none focus:border-cyan-500"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={handleKeywordSubmit}
            className="cursor-pointer"
          >
            <Search className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* 类目选择 */}
      <div>
        <label className="block text-sm text-slate-400 mb-1">类目</label>
        <select
          value={filter.category || ''}
          onChange={(e) => onFilterChange({ category: e.target.value || undefined })}
          className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded text-white text-sm focus:outline-none focus:border-cyan-500 cursor-pointer"
        >
          <option value="">全部类目</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* 状态选择 */}
      <div>
        <label className="block text-sm text-slate-400 mb-1">状态</label>
        <select
          value={filter.status || ''}
          onChange={(e) =>
            onFilterChange({
              status: (e.target.value as FilterConfig['status']) || undefined,
            })
          }
          className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded text-white text-sm focus:outline-none focus:border-cyan-500 cursor-pointer"
        >
          <option value="">全部状态</option>
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* 价格区间 */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm text-slate-400 mb-1">最低价(元)</label>
          <input
            type="number"
            value={filter.minPrice ? filter.minPrice / 100 : ''}
            onChange={(e) =>
              onFilterChange({
                minPrice: e.target.value ? Number(e.target.value) * 100 : undefined,
              })
            }
            min={0}
            placeholder="0"
            className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded text-white text-sm focus:outline-none focus:border-cyan-500"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">最高价(元)</label>
          <input
            type="number"
            value={filter.maxPrice ? filter.maxPrice / 100 : ''}
            onChange={(e) =>
              onFilterChange({
                maxPrice: e.target.value ? Number(e.target.value) * 100 : undefined,
              })
            }
            min={0}
            placeholder="不限"
            className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded text-white text-sm focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>
    </div>
  );
}
