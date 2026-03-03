'use client';

import { useMemo, useState } from 'react';
import { CircleDot } from 'lucide-react';

import { BackButton } from '@/components/shared/BackButton';

const ITEMS = ['A', 'B', 'C', 'D', 'E'];

export default function SetOperationsDemo() {
  const [setA, setSetA] = useState(0b10101); // A, C, E
  const [setB, setSetB] = useState(0b01110); // B, C, D

  const toggleA = (i: number) => setSetA((p) => p ^ (1 << i));
  const toggleB = (i: number) => setSetB((p) => p ^ (1 << i));

  const union = useMemo(() => setA | setB, [setA, setB]);
  const intersection = useMemo(() => setA & setB, [setA, setB]);
  const difference = useMemo(() => setA & ~setB, [setA, setB]);
  const symmetricDiff = useMemo(() => setA ^ setB, [setA, setB]);

  const toSet = (mask: number) => ITEMS.filter((_, i) => (mask & (1 << i)) !== 0).join(', ') || '∅';

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <BackButton fallbackHref="/problems/bit-manipulation" />
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <CircleDot className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold">高效集合运算</h1>
                <p className="text-sm text-slate-400">位运算实现集合操作</p>
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {[
            { label: '集合 A', set: setA, toggle: toggleA, color: 'blue' },
            { label: '集合 B', set: setB, toggle: toggleB, color: 'green' },
          ].map(({ label, set, toggle, color }) => (
            <div key={label} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <h3 className="font-semibold mb-3">
                {label}: {`{${toSet(set)}}`}
              </h3>
              <div className="flex gap-2">
                {ITEMS.map((item, i) => (
                  <button
                    key={item}
                    onClick={() => toggle(i)}
                    className={`w-10 h-10 rounded-lg cursor-pointer transition-colors
                      ${(set & (1 << i)) !== 0 ? `bg-${color}-500` : 'bg-slate-700'}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'A ∪ B (OR)', result: union, code: 'A | B' },
            { label: 'A ∩ B (AND)', result: intersection, code: 'A & B' },
            { label: 'A - B (DIFF)', result: difference, code: 'A & ~B' },
            { label: 'A △ B (XOR)', result: symmetricDiff, code: 'A ^ B' },
          ].map(({ label, result, code }) => (
            <div
              key={label}
              className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 text-center"
            >
              <div className="text-sm text-slate-400 mb-1">{label}</div>
              <div className="text-xl font-bold text-emerald-400 mb-2">{`{${toSet(result)}}`}</div>
              <code className="text-xs bg-slate-700 px-2 py-1 rounded">{code}</code>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
