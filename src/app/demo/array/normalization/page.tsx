'use client';

import { Database, List, TreePine } from 'lucide-react';

import { BackButton } from '@/components/shared/BackButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNormalization } from './hooks/useNormalization';
import type { FlatEntity, NestedEntity, NormalizedData } from './types';

function TreeView({ entity, depth = 0 }: { entity: NestedEntity; depth?: number }) {
  return (
    <div style={{ marginLeft: `${depth * 16}px` }}>
      <div className="py-1 text-sm">
        <span className="text-cyan-400">{entity.id}</span>
        <span className="text-slate-400 ml-2">{entity.name}</span>
      </div>
      {entity.children?.map((child) => (
        <TreeView key={child.id} entity={child} depth={depth + 1} />
      ))}
    </div>
  );
}

function FlatView({ normalized }: { normalized: NormalizedData }) {
  const entries = Object.values(normalized.byId).slice(0, 20);
  return (
    <div className="space-y-1">
      {entries.map((e: FlatEntity) => (
        <div key={e.id} className="text-xs font-mono bg-slate-800 p-1 rounded">
          <span className="text-cyan-400">{e.id}</span>
          <span className="text-slate-400"> → parent: {e.parentId || 'null'}</span>
        </div>
      ))}
      {normalized.allIds.length > 20 && (
        <div className="text-xs text-slate-500">...还有 {normalized.allIds.length - 20} 项</div>
      )}
    </div>
  );
}

export default function NormalizationDemo() {
  const { tree, normalized, metrics } = useNormalization();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <BackButton fallbackHref="/problems/array" />
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-teal-500/20">
                <Database className="w-6 h-6 text-teal-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold">数据归一化</h1>
                <p className="text-sm text-slate-400">嵌套 ⇄ 扁平 · O(n) DFS</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TreePine className="w-5 h-5 text-green-400" />
                嵌套结构
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-[400px] overflow-auto">
              <TreeView entity={tree} />
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <List className="w-5 h-5 text-cyan-400" />
                扁平结构 (byId)
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-[400px] overflow-auto">
              <FlatView normalized={normalized} />
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 p-4 bg-slate-900 border border-slate-800 rounded-lg">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-teal-400">{metrics.entityCount}</div>
              <div className="text-xs text-slate-500">实体数量</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-cyan-400">
                {metrics.flattenTime.toFixed(2)}ms
              </div>
              <div className="text-xs text-slate-500">扁平化耗时</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">
                {metrics.nestTime.toFixed(2)}ms
              </div>
              <div className="text-xs text-slate-500">嵌套化耗时</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
