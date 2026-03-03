'use client';

import { useCallback, useState } from 'react';
import { UserPlus, Users } from 'lucide-react';

import { BackButton } from '@/components/shared/BackButton';

interface Bucket {
  id: string;
  name: string;
  count: number;
}

const INITIAL_BUCKETS: Bucket[] = [
  { id: 'a', name: 'A 组 (对照)', count: 0 },
  { id: 'b', name: 'B 组 (实验)', count: 0 },
  { id: 'c', name: 'C 组 (实验2)', count: 0 },
];

export default function AbTrafficAllocationDemo() {
  const [buckets, setBuckets] = useState<Bucket[]>(INITIAL_BUCKETS);
  const [userCount, setUserCount] = useState(0);

  const addUser = useCallback(() => {
    setBuckets((prev) => {
      const sorted = [...prev].sort((a, b) => a.count - b.count);
      const minBucket = sorted[0];
      return prev.map((b) => (b.id === minBucket.id ? { ...b, count: b.count + 1 } : b));
    });
    setUserCount((c) => c + 1);
  }, []);

  const addBatch = useCallback(() => {
    for (let i = 0; i < 10; i++) {
      setTimeout(() => addUser(), i * 100);
    }
  }, [addUser]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <BackButton fallbackHref="/problems/greedy" />
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-pink-500/20">
                <Users className="w-6 h-6 text-pink-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold">AB 流量分配</h1>
                <p className="text-sm text-slate-400">贪心均衡分桶</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-xl">
        <div className="mb-6 text-center">
          <span className="text-4xl font-bold text-pink-400">{userCount}</span>
          <span className="text-slate-400 ml-2">用户</span>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {buckets.map((b) => (
            <div
              key={b.id}
              className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 text-center"
            >
              <h3 className="font-semibold mb-2">{b.name}</h3>
              <div className="text-3xl font-bold text-emerald-400">{b.count}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={addUser}
            className="flex-1 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-5 h-5" /> 添加用户
          </button>
          <button
            onClick={addBatch}
            className="px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg cursor-pointer"
          >
            +10
          </button>
        </div>
      </main>
    </div>
  );
}
