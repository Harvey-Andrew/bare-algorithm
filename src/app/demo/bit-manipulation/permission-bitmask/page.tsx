'use client';

import { useCallback, useState } from 'react';
import { Check, Shield } from 'lucide-react';

import { BackButton } from '@/components/shared/BackButton';

const PERMISSIONS = ['READ', 'WRITE', 'DELETE', 'ADMIN', 'EXPORT', 'IMPORT', 'AUDIT', 'CONFIG'];

export default function PermissionBitmaskDemo() {
  const [bitmask, setBitmask] = useState(0b00000101); // READ + DELETE

  const hasPermission = useCallback((index: number) => (bitmask & (1 << index)) !== 0, [bitmask]);
  const togglePermission = useCallback(
    (index: number) => setBitmask((prev) => prev ^ (1 << index)),
    []
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <BackButton fallbackHref="/problems/bit-manipulation" />
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/20">
                <Shield className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold">权限与开关管理</h1>
                <p className="text-sm text-slate-400">位掩码 O(1) 鉴权</p>
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <h3 className="font-semibold mb-4">权限开关</h3>
            <div className="space-y-2">
              {PERMISSIONS.map((p, i) => (
                <button
                  key={p}
                  onClick={() => togglePermission(i)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors
                    ${hasPermission(i) ? 'bg-emerald-500/20 border border-emerald-500' : 'bg-slate-700'}`}
                >
                  <span>{p}</span>
                  {hasPermission(i) && <Check className="w-5 h-5 text-emerald-400" />}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <h3 className="font-semibold mb-3">位表示</h3>
              <div className="font-mono text-2xl text-emerald-400 mb-2">
                {bitmask.toString(2).padStart(8, '0')}
              </div>
              <div className="text-slate-400">十进制: {bitmask}</div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <h3 className="font-semibold mb-3">位操作说明</h3>
              <div className="text-sm text-slate-300 space-y-1">
                <p>
                  检查:{' '}
                  <code className="bg-slate-700 px-1 rounded">(mask & (1 &lt;&lt; i)) !== 0</code>
                </p>
                <p>
                  开启: <code className="bg-slate-700 px-1 rounded">mask | (1 &lt;&lt; i)</code>
                </p>
                <p>
                  切换: <code className="bg-slate-700 px-1 rounded">mask ^ (1 &lt;&lt; i)</code>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
