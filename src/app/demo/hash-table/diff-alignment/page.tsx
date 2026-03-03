'use client';

import { useMemo } from 'react';
import { GitCompare } from 'lucide-react';

import { BackButton } from '@/components/shared/BackButton';

interface Item {
  key: string;
  value: string;
}

const OLD_LIST: Item[] = [
  { key: 'a', value: 'Apple' },
  { key: 'b', value: 'Banana' },
  { key: 'c', value: 'Cherry' },
  { key: 'd', value: 'Date' },
];

const NEW_LIST: Item[] = [
  { key: 'b', value: 'Banana' },
  { key: 'a', value: 'Apple Updated' },
  { key: 'e', value: 'Elderberry' },
  { key: 'c', value: 'Cherry' },
];

function diffLists(oldList: Item[], newList: Item[]) {
  const oldMap = new Map(oldList.map((item, i) => [item.key, { item, index: i }]));
  const operations: Array<{
    type: 'keep' | 'update' | 'add' | 'remove' | 'move';
    key: string;
    detail?: string;
  }> = [];

  newList.forEach((item, newIdx) => {
    const old = oldMap.get(item.key);
    if (!old) {
      operations.push({ type: 'add', key: item.key });
    } else if (old.item.value !== item.value) {
      operations.push({
        type: 'update',
        key: item.key,
        detail: `${old.item.value} → ${item.value}`,
      });
    } else if (old.index !== newIdx) {
      operations.push({ type: 'move', key: item.key, detail: `${old.index} → ${newIdx}` });
    } else {
      operations.push({ type: 'keep', key: item.key });
    }
    oldMap.delete(item.key);
  });

  oldMap.forEach((_, key) => operations.push({ type: 'remove', key }));
  return operations;
}

export default function DiffAlignmentDemo() {
  const operations = useMemo(() => diffLists(OLD_LIST, NEW_LIST), []);

  const colors = {
    keep: 'bg-slate-700',
    update: 'bg-amber-500/20',
    add: 'bg-emerald-500/20',
    remove: 'bg-red-500/20',
    move: 'bg-blue-500/20',
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <BackButton fallbackHref="/problems/hash-table" />
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <GitCompare className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Diff 列表对齐</h1>
                <p className="text-sm text-slate-400">Map 实现 O(1) 定位</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-3 gap-4 max-w-4xl mx-auto">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <h3 className="font-semibold mb-3">旧列表</h3>
            {OLD_LIST.map((item) => (
              <div key={item.key} className="p-2 bg-slate-700 rounded mb-2">
                {item.key}: {item.value}
              </div>
            ))}
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <h3 className="font-semibold mb-3">新列表</h3>
            {NEW_LIST.map((item) => (
              <div key={item.key} className="p-2 bg-slate-700 rounded mb-2">
                {item.key}: {item.value}
              </div>
            ))}
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <h3 className="font-semibold mb-3">Diff 操作</h3>
            {operations.map((op, i) => (
              <div key={i} className={`p-2 rounded mb-2 text-sm ${colors[op.type]}`}>
                <span className="font-mono">{op.key}</span>: {op.type}{' '}
                {op.detail && `(${op.detail})`}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
