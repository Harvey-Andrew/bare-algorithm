'use client';

import { useMemo, useState } from 'react';
import { AlignLeft } from 'lucide-react';

import { BackButton } from '@/components/shared/BackButton';

const SAMPLE_TEXT =
  'The quick brown fox jumps over the lazy dog and continues to run through the forest';

function wrapText(text: string, maxWidth: number): string[][] {
  const words = text.split(' ');
  const lines: string[][] = [];
  let currentLine: string[] = [];
  let currentWidth = 0;

  for (const word of words) {
    if (currentWidth + word.length + currentLine.length <= maxWidth) {
      currentLine.push(word);
      currentWidth += word.length;
    } else {
      if (currentLine.length > 0) lines.push(currentLine);
      currentLine = [word];
      currentWidth = word.length;
    }
  }
  if (currentLine.length > 0) lines.push(currentLine);
  return lines;
}

export default function LayoutTextWrappingDemo() {
  const [maxWidth, setMaxWidth] = useState(30);
  const lines = useMemo(() => wrapText(SAMPLE_TEXT, maxWidth), [maxWidth]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <BackButton fallbackHref="/problems/dynamic-programming" />
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <AlignLeft className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold">排版优化</h1>
                <p className="text-sm text-slate-400">动态规划断行</p>
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 mb-6">
          <label className="text-sm text-slate-400">行宽限制: {maxWidth} 字符</label>
          <input
            type="range"
            min={20}
            max={50}
            value={maxWidth}
            onChange={(e) => setMaxWidth(Number(e.target.value))}
            className="w-full mt-2"
          />
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <h3 className="font-semibold mb-4">排版结果</h3>
          <div className="font-mono text-sm space-y-1">
            {lines.map((line, i) => {
              const text = line.join(' ');
              return (
                <div key={i} className="flex">
                  <span className="text-slate-500 w-8">{i + 1}.</span>
                  <span className="bg-slate-700/50 px-2 rounded">{text}</span>
                  <span className="text-slate-600 text-xs ml-2">
                    ({text.length}/{maxWidth})
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
