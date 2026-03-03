'use client';

import { X } from 'lucide-react';

import type { FilterDimension } from '../types';

interface Props {
  dimensions: FilterDimension[];
  onRemoveOption: (dimIndex: number, optIndex: number) => void;
}

export function DimensionPanel({ dimensions, onRemoveOption }: Props) {
  return (
    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
      <h3 className="font-semibold mb-4">筛选维度</h3>
      <div className="space-y-4">
        {dimensions.map((dim, dimIdx) => (
          <div key={dim.name}>
            <div className="text-sm text-slate-400 mb-2">{dim.name}</div>
            <div className="flex flex-wrap gap-2">
              {dim.options.map((opt, optIdx) => (
                <div
                  key={opt}
                  className="px-3 py-1 bg-slate-700 rounded-lg flex items-center gap-2 group"
                >
                  <span>{opt}</span>
                  {dim.options.length > 1 && (
                    <button
                      onClick={() => onRemoveOption(dimIdx, optIdx)}
                      className="opacity-0 group-hover:opacity-100 text-slate-400
                        hover:text-red-400 transition-opacity cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
