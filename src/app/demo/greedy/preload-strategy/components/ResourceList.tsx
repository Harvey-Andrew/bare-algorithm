'use client';

import { Check, Clock, Eye } from 'lucide-react';

import type { Resource } from '../types';

interface Props {
  resources: Resource[];
  loadedIds: Set<string>;
}

export function ResourceList({ resources, loadedIds }: Props) {
  return (
    <div className="space-y-2">
      {resources.map((r, idx) => {
        const isLoaded = loadedIds.has(r.id);
        return (
          <div
            key={r.id}
            className={`p-3 rounded-lg flex items-center justify-between transition-all
              ${isLoaded ? 'bg-emerald-500/20 border border-emerald-500' : 'bg-slate-700'}`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 w-6">{idx + 1}</span>
              <span className="font-mono text-sm">{r.name}</span>
              {r.inViewport && <Eye className="w-4 h-4 text-blue-400" />}
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-slate-400">P{r.priority}</span>
              <span className="text-xs text-slate-400">{r.size}KB</span>
              {isLoaded ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Clock className="w-4 h-4 text-slate-500" />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
