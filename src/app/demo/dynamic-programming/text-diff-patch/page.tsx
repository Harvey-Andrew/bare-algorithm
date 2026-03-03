'use client';

import { useMemo, useState } from 'react';
import { FileText, Minus, Plus } from 'lucide-react';

import { BackButton } from '@/components/shared/BackButton';

function computeDiff(
  a: string,
  b: string
): Array<{ type: 'same' | 'add' | 'remove'; text: string }> {
  const result: Array<{ type: 'same' | 'add' | 'remove'; text: string }> = [];
  const aLines = a.split('\n');
  const bLines = b.split('\n');

  // 简化的 LCS diff
  let i = 0,
    j = 0;
  while (i < aLines.length || j < bLines.length) {
    if (i < aLines.length && j < bLines.length && aLines[i] === bLines[j]) {
      result.push({ type: 'same', text: aLines[i] });
      i++;
      j++;
    } else if (j < bLines.length && (i >= aLines.length || !aLines.slice(i).includes(bLines[j]))) {
      result.push({ type: 'add', text: bLines[j] });
      j++;
    } else {
      result.push({ type: 'remove', text: aLines[i] });
      i++;
    }
  }
  return result;
}

export default function TextDiffPatchDemo() {
  const [textA, setTextA] = useState(
    'function hello() {\n  console.log("Hello");\n  return true;\n}'
  );
  const [textB, setTextB] = useState(
    'function hello() {\n  console.log("Hello World");\n  console.log("Welcome");\n  return true;\n}'
  );
  const diff = useMemo(() => computeDiff(textA, textB), [textA, textB]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <BackButton fallbackHref="/problems/dynamic-programming" />
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/20">
                <FileText className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold">文本 Diff / Patch</h1>
                <p className="text-sm text-slate-400">LCS 算法计算差异</p>
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <h3 className="font-semibold mb-3">原文本</h3>
            <textarea
              value={textA}
              onChange={(e) => setTextA(e.target.value)}
              className="w-full h-40 bg-slate-900 rounded p-3 font-mono text-sm resize-none"
            />
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <h3 className="font-semibold mb-3">新文本</h3>
            <textarea
              value={textB}
              onChange={(e) => setTextB(e.target.value)}
              className="w-full h-40 bg-slate-900 rounded p-3 font-mono text-sm resize-none"
            />
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <h3 className="font-semibold mb-3">Diff 结果</h3>
            <div className="font-mono text-sm space-y-1">
              {diff.map((d, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2 px-2 py-1 rounded
                  ${d.type === 'add' ? 'bg-emerald-500/20 text-emerald-400' : d.type === 'remove' ? 'bg-red-500/20 text-red-400' : ''}`}
                >
                  {d.type === 'add' ? (
                    <Plus className="w-3 h-3" />
                  ) : d.type === 'remove' ? (
                    <Minus className="w-3 h-3" />
                  ) : (
                    <span className="w-3" />
                  )}
                  <span>{d.text || '(空行)'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
