'use client';

import { useCallback, useMemo, useState } from 'react';
import { Shuffle, Users } from 'lucide-react';

import { BackButton } from '@/components/shared/BackButton';

const BUCKETS = ['A', 'B', 'C', 'D'];

function hashToBucket(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash << 5) - hash + userId.charCodeAt(i);
    hash = hash & hash;
  }
  return BUCKETS[Math.abs(hash) % BUCKETS.length];
}

export default function RandomSamplingDemo() {
  const [users, setUsers] = useState<Array<{ id: string; bucket: string }>>([]);

  const addUser = useCallback(() => {
    const id = `user_${Math.random().toString(36).slice(2, 8)}`;
    const bucket = hashToBucket(id);
    setUsers((prev) => [...prev, { id, bucket }]);
  }, []);

  const bucketCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const b of BUCKETS) counts[b] = 0;
    for (const u of users) counts[u.bucket]++;
    return counts;
  }, [users]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <BackButton fallbackHref="/problems/hash-table" />
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-pink-500/20">
                <Shuffle className="w-6 h-6 text-pink-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold">随机与抽样</h1>
                <p className="text-sm text-slate-400">哈希取模分桶</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-xl">
        <div className="flex gap-2 mb-6">
          <button
            onClick={addUser}
            className="flex-1 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-lg cursor-pointer flex items-center justify-center gap-2"
          >
            <Users className="w-5 h-5" /> 添加用户
          </button>
          <button
            onClick={() => {
              for (let i = 0; i < 10; i++) setTimeout(addUser, i * 50);
            }}
            className="px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg cursor-pointer"
          >
            +10
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {BUCKETS.map((b) => (
            <div
              key={b}
              className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 text-center"
            >
              <div className="text-2xl font-bold text-pink-400">{bucketCounts[b]}</div>
              <div className="text-sm text-slate-400">桶 {b}</div>
            </div>
          ))}
        </div>

        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <h3 className="font-semibold mb-3">最近用户</h3>
          <div className="space-y-1 max-h-40 overflow-y-auto text-sm font-mono">
            {users
              .slice(-10)
              .reverse()
              .map((u) => (
                <div key={u.id} className="flex justify-between">
                  <span>{u.id}</span>
                  <span className="text-pink-400">→ {u.bucket}</span>
                </div>
              ))}
          </div>
        </div>
      </main>
    </div>
  );
}
