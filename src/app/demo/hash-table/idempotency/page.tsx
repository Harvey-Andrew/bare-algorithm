'use client';

import { useCallback, useState } from 'react';
import { Send, Shield } from 'lucide-react';

import { BackButton } from '@/components/shared/BackButton';

export default function IdempotencyDemo() {
  const [requestId, setRequestId] = useState('');
  const [log, setLog] = useState<string[]>([]);
  const [processedIds, setProcessedIds] = useState<string[]>([]);

  const submit = useCallback(() => {
    if (!requestId.trim()) return;

    if (processedIds.includes(requestId)) {
      setLog((prev) => [...prev, `[拒绝] ${requestId} - 重复请求`]);
    } else {
      setProcessedIds((prev) => [...prev, requestId]);
      setLog((prev) => [...prev, `[成功] ${requestId} - 已处理`]);
    }
    setRequestId('');
  }, [requestId, processedIds]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <BackButton fallbackHref="/problems/hash-table" />
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/20">
                <Shield className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold">幂等与防重</h1>
                <p className="text-sm text-slate-400">Set 拦截重复提交</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-xl">
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 mb-4">
          <div className="flex gap-2">
            <input
              value={requestId}
              onChange={(e) => setRequestId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              placeholder="输入请求ID (如: order-123)..."
              className="flex-1 px-4 py-2 bg-slate-700 rounded-lg border border-slate-600"
            />
            <button
              onClick={submit}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg cursor-pointer flex items-center gap-2"
            >
              <Send className="w-4 h-4" /> 提交
            </button>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 mb-4">
          <h3 className="font-semibold mb-3">已处理ID集合</h3>
          <div className="flex flex-wrap gap-1">
            {processedIds.map((id) => (
              <span key={id} className="px-2 py-1 bg-emerald-500/20 rounded text-xs">
                {id}
              </span>
            ))}
            {processedIds.length === 0 && <span className="text-slate-500">空</span>}
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <h3 className="font-semibold mb-3">处理日志</h3>
          <div className="space-y-1 max-h-40 overflow-y-auto font-mono text-sm">
            {log.map((entry, i) => (
              <div key={i} className={entry.includes('拒绝') ? 'text-red-400' : 'text-emerald-400'}>
                {entry}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
