'use client';

import type { GenerationResult } from '../types';

interface Props {
  result: GenerationResult | null;
}

export function ResultGrid({ result }: Props) {
  if (!result) {
    return (
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 text-center text-slate-500">
        点击【生成组合】查看结果
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">SKU 组合结果</h3>
        <span className="text-sm text-slate-400">
          共 {result.totalCount} 个 · 耗时 {result.generationTime.toFixed(2)}ms
        </span>
      </div>
      <div className="max-h-80 overflow-y-auto space-y-2">
        {result.combinations.slice(0, 100).map((combo) => (
          <div
            key={combo.id}
            className="p-3 bg-slate-700/50 rounded-lg flex items-center justify-between"
          >
            <span className="text-xs text-slate-500">{combo.id}</span>
            <div className="flex gap-2">
              {Object.entries(combo.values).map(([key, value]) => (
                <span
                  key={key}
                  className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-xs"
                >
                  {key}: {value}
                </span>
              ))}
            </div>
          </div>
        ))}
        {result.totalCount > 100 && (
          <div className="text-center text-slate-500 text-sm py-2">
            ... 还有 {result.totalCount - 100} 个组合
          </div>
        )}
      </div>
    </div>
  );
}
