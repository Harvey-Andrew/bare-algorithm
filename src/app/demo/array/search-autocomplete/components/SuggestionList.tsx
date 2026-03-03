'use client';

import { TrendingUp } from 'lucide-react';

import { formatHeat } from '../services/search.api';
import type { Suggestion } from '../types';

interface SuggestionListProps {
  suggestions: Suggestion[];
  onSelect: (keyword: string) => void;
}

/**
 * 搜索建议列表组件
 */
export function SuggestionList({ suggestions, onSelect }: SuggestionListProps) {
  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden mt-2">
      {suggestions.map((suggestion, idx) => (
        <div
          key={`${suggestion.keyword}-${idx}`}
          onClick={() => onSelect(suggestion.keyword)}
          className="flex items-center justify-between px-4 py-3 hover:bg-slate-800 cursor-pointer transition-colors border-b border-slate-800 last:border-b-0"
        >
          <div className="flex items-center gap-3">
            <TrendingUp className="w-4 h-4 text-slate-500" />
            <div>
              <div
                className="text-white"
                dangerouslySetInnerHTML={{ __html: suggestion.highlightedKeyword }}
              />
              <div className="text-xs text-slate-500">{suggestion.category}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {suggestion.matchType === 'fuzzy' && (
              <span className="text-xs px-1.5 py-0.5 bg-purple-500/20 text-purple-400 rounded">
                模糊
              </span>
            )}
            <span className="text-xs text-slate-400">{formatHeat(suggestion.heat)} 热度</span>
          </div>
        </div>
      ))}

      <style jsx global>{`
        mark {
          background-color: rgba(34, 211, 238, 0.3);
          color: #22d3ee;
          padding: 0 2px;
          border-radius: 2px;
        }
      `}</style>
    </div>
  );
}
