'use client';

import { Info } from 'lucide-react';

export function AlgorithmInfo() {
  return (
    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
      <div className="flex items-center gap-2 mb-3">
        <Info className="w-5 h-5 text-purple-400" />
        <h3 className="font-semibold">算法说明</h3>
      </div>
      <div className="text-sm text-slate-300 space-y-2">
        <p>
          <strong>LRU (Least Recently Used)</strong> 最近最少使用缓存淘汰策略。
        </p>
        <p>当缓存满时，移除最久未访问的条目。</p>
        <ul className="list-disc list-inside text-slate-400 space-y-1">
          <li>使用 Map 保持插入顺序</li>
          <li>访问时删除并重新插入实现「移到最新」</li>
          <li>get/put 时间复杂度 O(1)</li>
        </ul>
      </div>
    </div>
  );
}
