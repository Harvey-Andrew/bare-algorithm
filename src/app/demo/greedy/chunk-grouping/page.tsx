'use client';

import { useMemo } from 'react';
import { Package } from 'lucide-react';

import { BackButton } from '@/components/shared/BackButton';

interface Module {
  id: string;
  name: string;
  size: number;
  deps: string[];
}

const MODULES: Module[] = [
  { id: 'react', name: 'react', size: 100, deps: [] },
  { id: 'lodash', name: 'lodash', size: 80, deps: [] },
  { id: 'utils', name: 'utils', size: 20, deps: ['lodash'] },
  { id: 'ui', name: 'ui-lib', size: 150, deps: ['react'] },
  { id: 'app', name: 'app', size: 50, deps: ['react', 'utils', 'ui'] },
];

function greedyChunk(modules: Module[]): Module[][] {
  const MAX_CHUNK_SIZE = 200;
  const chunks: Module[][] = [];
  const sorted = [...modules].sort((a, b) => b.size - a.size);

  for (const mod of sorted) {
    let placed = false;
    for (const chunk of chunks) {
      const chunkSize = chunk.reduce((s, m) => s + m.size, 0);
      if (chunkSize + mod.size <= MAX_CHUNK_SIZE) {
        chunk.push(mod);
        placed = true;
        break;
      }
    }
    if (!placed) chunks.push([mod]);
  }
  return chunks;
}

export default function ChunkGroupingDemo() {
  const chunks = useMemo(() => greedyChunk(MODULES), []);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <BackButton fallbackHref="/problems/greedy" />
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/20">
                <Package className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Chunk 分组与拆包</h1>
                <p className="text-sm text-slate-400">贪心分组减少请求数</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {chunks.map((chunk, i) => (
            <div key={i} className="bg-slate-800/50 rounded-xl p-4 border border-cyan-500/30">
              <h3 className="font-semibold mb-3">Chunk {i + 1}</h3>
              <div className="space-y-2">
                {chunk.map((m) => (
                  <div key={m.id} className="p-2 bg-slate-700 rounded flex justify-between">
                    <span>{m.name}</span>
                    <span className="text-cyan-400">{m.size}KB</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-right text-sm text-slate-400">
                总计: {chunk.reduce((s, m) => s + m.size, 0)}KB
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
