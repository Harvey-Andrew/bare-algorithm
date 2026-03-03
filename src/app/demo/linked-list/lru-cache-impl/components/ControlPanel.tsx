'use client';

import { Loader2, Search, Trash2 } from 'lucide-react';

interface Props {
  queryKey: string;
  setQueryKey: (key: string) => void;
  availableKeys: string[];
  loading: boolean;
  onGet: (key: string) => void;
  onClear: () => void;
}

export function ControlPanel({
  queryKey,
  setQueryKey,
  availableKeys,
  loading,
  onGet,
  onClear,
}: Props) {
  return (
    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
      <h3 className="font-semibold mb-4">操作面板</h3>

      <div className="space-y-4">
        {/* 查询输入 */}
        <div>
          <label className="text-sm text-slate-400 block mb-2">查询 Key</label>
          <div className="flex gap-2">
            <select
              value={queryKey}
              onChange={(e) => setQueryKey(e.target.value)}
              className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">选择 Key...</option>
              {availableKeys.map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
            <button
              onClick={() => queryKey && onGet(queryKey)}
              disabled={!queryKey || loading}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50
                rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              查询
            </button>
          </div>
        </div>

        {/* 快捷按钮 */}
        <div>
          <label className="text-sm text-slate-400 block mb-2">快捷操作</label>
          <div className="flex flex-wrap gap-2">
            {availableKeys.slice(0, 4).map((key) => (
              <button
                key={key}
                onClick={() => onGet(key)}
                disabled={loading}
                className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm
                  transition-colors cursor-pointer disabled:opacity-50"
              >
                {key}
              </button>
            ))}
          </div>
        </div>

        {/* 清空 */}
        <button
          onClick={onClear}
          className="w-full px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400
            rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
          清空缓存
        </button>
      </div>
    </div>
  );
}
