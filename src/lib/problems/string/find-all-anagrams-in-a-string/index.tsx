'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { CodePanel } from '@/components/shared/CodePanel';
import { findProblemMeta } from '@/lib/problems/problem-data';
import { AlgorithmConfig } from '@/types/visualizer';
import problemData from '../problem.json';
import {
  COUNT_LEGEND,
  DEFAULT_INPUT,
  DIFF_LEGEND,
  MODES,
  SW_COUNT_CODE,
  SW_DIFF_CODE,
} from './constants';
import { generateCountFrames, generateDiffFrames } from './frames';
import { AlgorithmMode, FindAnagramsFrame, FindAnagramsInput } from './types';

const problem = findProblemMeta(problemData as unknown[], 'find-all-anagrams-in-a-string')!;

function formatInput(input: FindAnagramsInput): string {
  return `s = "${input.s}", p = "${input.p}"`;
}

function parseInput(input: string): FindAnagramsInput | null {
  const m = input.match(/"([^"]*)"/g);
  return m && m.length >= 2 ? { s: m[0].replace(/"/g, ''), p: m[1].replace(/"/g, '') } : null;
}

function generateRandomInput(): FindAnagramsInput {
  const chars = 'abcdef';
  const pLen = Math.floor(Math.random() * 3) + 2; // 2~4
  let p = '';
  for (let i = 0; i < pLen; i++) p += chars[Math.floor(Math.random() * 4)];

  const sLen = Math.floor(Math.random() * 8) + 8; // 8~15
  let s = '';
  for (let i = 0; i < sLen; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return { s, p };
}

// ─── 字符条 ──────────────────────────────────────
function CharStrip({ currentFrame }: { currentFrame: FindAnagramsFrame }) {
  const { s, p, left, right, result, phase, mode, addedChar, removedChar } = currentFrame;
  const k = p.length;
  const isDiff = mode === AlgorithmMode.DIFF_OPTIMIZED;
  const windowColor = isDiff ? 'bg-amber-500' : 'bg-blue-500';

  return (
    <div className="flex gap-[3px] justify-center flex-wrap px-2">
      {s.split('').map((c, idx) => {
        const inWindow = idx >= left && idx <= right && right - left + 1 <= k;
        const isAdded = idx === right && c === addedChar;
        const isRemoved = idx === left - 1 && removedChar;

        // 检查是否属于某个已确认的匹配区间
        const inMatchResult = result.some((r) => idx >= r && idx < r + k);
        const isCurrentMatch = phase === 'match' && inWindow;

        let bgColor = 'bg-slate-700 text-slate-500';
        if (isCurrentMatch || (phase === 'completed' && inMatchResult)) {
          bgColor = 'bg-emerald-500 text-white';
        } else if (inWindow) {
          bgColor = `${windowColor} text-white`;
        } else if (isRemoved) {
          bgColor = 'bg-rose-500/30 text-rose-400';
        }

        return (
          <motion.div
            key={idx}
            layout
            animate={{
              scale: isCurrentMatch ? 1.15 : isAdded ? 1.1 : 1,
              y: isCurrentMatch ? -4 : 0,
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className={`relative flex items-center justify-center w-8 h-9 lg:w-10 lg:h-11 rounded-lg font-mono text-base lg:text-lg font-bold border-2 transition-colors ${
              isCurrentMatch
                ? 'border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.4)] z-10'
                : inWindow
                  ? 'border-transparent shadow-md z-10'
                  : 'border-slate-600/50'
            } ${bgColor}`}
          >
            {c}
            {/* 下标 */}
            <span className="absolute -bottom-5 text-[9px] text-slate-500 font-mono">{idx}</span>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── 频率对比面板 ────────────────────────────────
function FreqPanel({ currentFrame }: { currentFrame: FindAnagramsFrame }) {
  const { pCount, sCount, phase } = currentFrame;
  const allChars = Array.from(new Set([...Object.keys(pCount), ...Object.keys(sCount)])).sort();

  return (
    <div className="w-full p-3 border border-dashed border-slate-600 rounded-lg bg-slate-900/50 mt-2">
      <div className="text-xs text-slate-400/70 mb-3 font-mono uppercase tracking-widest text-center">
        Frequency Comparison
      </div>
      <div className="flex gap-3 justify-center flex-wrap">
        {allChars.map((ch) => {
          const pv = pCount[ch] || 0;
          const sv = sCount[ch] || 0;
          const isMatch = pv === sv && pv > 0;
          const isOver = sv > pv;

          return (
            <motion.div
              key={`freq-${ch}`}
              layout
              className={`flex flex-col items-center p-2 rounded-lg border transition-all ${
                isMatch && phase !== 'init'
                  ? 'bg-emerald-900/40 border-emerald-500/50'
                  : isOver
                    ? 'bg-rose-900/30 border-rose-500/40'
                    : 'bg-slate-800 border-slate-700'
              }`}
            >
              <span className="text-lg font-mono font-black text-slate-200">{ch}</span>
              <div className="flex gap-2 mt-1">
                <div className="flex flex-col items-center">
                  <span className="text-[9px] text-blue-400/60">p</span>
                  <span className="text-sm font-mono font-bold text-blue-300">{pv}</span>
                </div>
                <div className="text-slate-600 text-xs self-end mb-0.5">vs</div>
                <div className="flex flex-col items-center">
                  <span className="text-[9px] text-amber-400/60">win</span>
                  <motion.span
                    key={sv}
                    initial={{ scale: 1.3 }}
                    animate={{ scale: 1 }}
                    className={`text-sm font-mono font-bold ${
                      isMatch ? 'text-emerald-400' : isOver ? 'text-rose-400' : 'text-amber-300'
                    }`}
                  >
                    {sv}
                  </motion.span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─── 主渲染器 ────────────────────────────────────
function RendererVisualizer({ currentFrame }: { currentFrame: FindAnagramsFrame }) {
  const { p, result, phase, diff, mode } = currentFrame;
  const isDiff = mode === AlgorithmMode.DIFF_OPTIMIZED;

  return (
    <div className="p-4 space-y-4 flex flex-col items-center select-none w-full">
      {/* 头部信息 */}
      <div className="flex items-center gap-6">
        {/* 目标模式串 */}
        <div className="flex flex-col items-center">
          <span className="text-xs text-slate-500 mb-1">Pattern p</span>
          <div className="text-xl font-mono font-black text-cyan-300 bg-cyan-950/40 px-4 py-1.5 rounded-lg border border-cyan-700/30">
            &quot;{p}&quot;
          </div>
        </div>

        {/* diff 指示器（仅 Diff 模式） */}
        {isDiff && diff !== undefined && (
          <div className="flex flex-col items-center">
            <span className="text-xs text-slate-500 mb-1">Diff</span>
            <motion.div
              key={diff}
              initial={{ scale: 1.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`text-2xl font-mono font-black px-3 py-1 rounded-lg ${
                diff === 0
                  ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-500/30'
                  : 'text-amber-400 bg-amber-950/40 border border-amber-500/30'
              }`}
            >
              {diff}
            </motion.div>
          </div>
        )}

        {/* 已找到数量 */}
        <div className="flex flex-col items-center">
          <span className="text-xs text-slate-500 mb-1">Found</span>
          <motion.div
            key={result.length}
            initial={{ scale: 1.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`text-2xl font-mono font-black ${
              phase === 'completed' ? 'text-emerald-400' : 'text-slate-400'
            }`}
          >
            {result.length}
          </motion.div>
        </div>
      </div>

      {/* 字符条 */}
      <CharStrip currentFrame={currentFrame} />

      {/* 频率对比 */}
      <FreqPanel currentFrame={currentFrame} />

      {/* 结果集 */}
      {result.length > 0 && (
        <div className="flex gap-2 flex-wrap justify-center mt-1">
          <span className="text-xs text-slate-500 mr-1 self-center">Indices:</span>
          <AnimatePresence>
            {result.map((idx) => (
              <motion.span
                key={`res-${idx}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="px-3 py-1 bg-emerald-950/50 border border-emerald-700/60 rounded text-emerald-400 font-mono text-sm font-bold"
              >
                {idx}
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function RendererCodePanel({ currentFrame }: { currentFrame: FindAnagramsFrame }) {
  const lines = currentFrame.mode === AlgorithmMode.DIFF_OPTIMIZED ? SW_DIFF_CODE : SW_COUNT_CODE;
  return <CodePanel codeLines={lines} label="Code" highlightLine={currentFrame.line} />;
}

export const findAnagramsConfig: AlgorithmConfig<FindAnagramsInput, FindAnagramsFrame> = {
  id: problem.id,
  title: problem.title,
  externalLinks: problem.externalLinks,
  modes: MODES,
  defaultMode: AlgorithmMode.SLIDING_WINDOW,
  defaultInput: DEFAULT_INPUT,
  parseInput,
  formatInput,
  generateRandomInput,
  legend: ((mode: AlgorithmMode | string) => {
    if (mode === AlgorithmMode.DIFF_OPTIMIZED) return DIFF_LEGEND;
    return COUNT_LEGEND;
  }) as (mode: string) => { colorBg: string; label: string }[],
  RendererVisualizer: (props) => <RendererVisualizer {...props} />,
  renderCodePanel: (props) => <RendererCodePanel {...props} />,
  generateFrames: (input, mode) => {
    switch (mode) {
      case AlgorithmMode.DIFF_OPTIMIZED:
        return generateDiffFrames(input);
      case AlgorithmMode.SLIDING_WINDOW:
      default:
        return generateCountFrames(input);
    }
  },
};
