'use client';

import { Flame } from 'lucide-react';

import { HOT_KEYWORDS } from '../constants';

interface HotTagsProps {
  onSelect: (keyword: string) => void;
}

/**
 * 热门搜索标签组件
 */
export function HotTags({ onSelect }: HotTagsProps) {
  return (
    <div className="mt-4">
      <div className="flex items-center gap-2 text-slate-400 mb-3">
        <Flame className="w-4 h-4 text-orange-400" />
        <span className="text-sm">热门搜索</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {HOT_KEYWORDS.map((keyword) => (
          <button
            key={keyword}
            onClick={() => onSelect(keyword)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-full transition-colors cursor-pointer"
          >
            {keyword}
          </button>
        ))}
      </div>
    </div>
  );
}
