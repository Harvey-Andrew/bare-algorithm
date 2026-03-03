'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { CodePanel } from '@/components/shared/CodePanel';
import { findProblemMeta } from '@/lib/problems/problem-data';
import { AlgorithmConfig } from '@/types/visualizer';
import problemData from '../problem.json';
import {
  DEFAULT_INPUT,
  MAP_LEGEND,
  MODES,
  SET_LEGEND,
  SW_MAP_CODE,
  SW_SET_CODE,
} from './constants';
import { generateMapFrames, generateSetFrames } from './frames';
import { AlgorithmMode, LongestSubstringFrame, LongestSubstringInput } from './types';

const problem = findProblemMeta(
  problemData as unknown[],
  'longest-substring-without-repeating-characters'
)!;

function formatInput(input: LongestSubstringInput): string {
  return `s = "${input.s}"`;
}

function parseInput(input: string): LongestSubstringInput | null {
  const m = input.match(/"([^"]*)"/);
  return m ? { s: m[1] } : { s: input.replace(/^s\s*=\s*/, '').trim() };
}

function generateRandomInput(): LongestSubstringInput {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  const pool = chars.slice(0, Math.floor(Math.random() * 8) + 4); // 4~11种字符
  const len = Math.floor(Math.random() * 10) + 6; // 6~15
  let s = '';
  for (let i = 0; i < len; i++) {
    s += pool[Math.floor(Math.random() * pool.length)];
  }
  return { s };
}

// ─── 字符条渲染 ──────────────────────────────────
function CharStrip({ currentFrame }: { currentFrame: LongestSubstringFrame }) {
  const { s, left, right, phase, conflictChar, bestLeft, bestRight, mode, jumpFrom } = currentFrame;
  const isMap = mode === AlgorithmMode.SLIDING_WINDOW_MAP;
  const windowColor = isMap ? 'bg-emerald-500' : 'bg-blue-500';

  return (
    <div className="flex gap-[3px] justify-center flex-wrap px-2">
      {s.split('').map((c, idx) => {
        const inWindow = idx >= left && idx <= right;
        const isLeft = idx === left;
        const isRight = idx === right;
        const isConflict = phase === 'shrinking' && c === conflictChar && inWindow;
        const inBest = idx >= bestLeft && idx <= bestRight;
        const isJumpedOver =
          isMap && phase === 'shrinking' && jumpFrom !== undefined && idx >= jumpFrom && idx < left;

        let bgColor = 'bg-slate-700 text-slate-500';
        if (isJumpedOver) {
          bgColor = 'bg-rose-900/30 text-rose-400/50 line-through';
        } else if (isConflict) {
          bgColor = 'bg-rose-500/60 text-white border-rose-500';
        } else if (inWindow) {
          bgColor = `${windowColor} text-white`;
        } else if (inBest && phase === 'completed') {
          bgColor = 'bg-emerald-900/40 text-emerald-300 border-emerald-500/50';
        }

        const isPointer = isLeft || isRight;

        return (
          <motion.div
            key={idx}
            layout
            animate={{
              scale: isPointer ? 1.15 : isConflict ? 1.1 : 1,
              rotateZ: isConflict ? [0, -8, 8, -8, 0] : 0,
            }}
            transition={{ duration: isConflict ? 0.4 : 0.2 }}
            className={`relative flex items-center justify-center w-9 h-10 lg:w-11 lg:h-12 rounded-lg font-mono text-lg lg:text-xl font-bold border-2 transition-colors ${
              isPointer ? 'border-transparent shadow-lg z-10' : 'border-slate-600/50'
            } ${bgColor}`}
          >
            {c}
            {/* 指针标签 */}
            {isLeft && (
              <motion.div
                layoutId="sw-left-ptr"
                className="absolute -bottom-6 text-[10px] font-bold text-amber-400"
              >
                L
              </motion.div>
            )}
            {isRight && right >= 0 && (
              <motion.div
                layoutId="sw-right-ptr"
                className="absolute -bottom-6 text-[10px] font-bold text-cyan-400"
              >
                R
              </motion.div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Set/Map 面板 ────────────────────────────────
function DataStructPanel({ currentFrame }: { currentFrame: LongestSubstringFrame }) {
  const { mode, windowChars, charMap, conflictChar, phase } = currentFrame;
  const isMap = mode === AlgorithmMode.SLIDING_WINDOW_MAP;

  if (isMap && charMap) {
    const entries = Object.entries(charMap).sort(([a], [b]) => a.localeCompare(b));
    return (
      <div className="w-full p-3 border border-dashed border-emerald-500/30 rounded-lg bg-slate-900/50">
        <div className="text-xs text-emerald-400/70 mb-2 font-mono uppercase tracking-widest">
          Map&lt;char, lastIndex&gt;
        </div>
        <div className="flex flex-wrap gap-1.5 min-h-8">
          <AnimatePresence>
            {entries.length === 0 ? (
              <span className="text-slate-600 italic text-sm">Empty</span>
            ) : (
              entries.map(([char, pos]) => (
                <motion.div
                  key={`map-${char}`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-sm font-mono ${
                    phase === 'shrinking' && char === conflictChar
                      ? 'bg-rose-500/40 text-rose-300 border border-rose-500'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  <span className="font-bold">{char}</span>
                  <span className="text-[10px] opacity-50">→</span>
                  <span className="text-xs opacity-70">{pos}</span>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // Set 模式
  const chars = windowChars || [];
  return (
    <div className="w-full p-3 border border-dashed border-blue-500/30 rounded-lg bg-slate-900/50">
      <div className="text-xs text-blue-400/70 mb-2 font-mono uppercase tracking-widest">
        Set (window chars)
      </div>
      <div className="flex flex-wrap gap-1.5 min-h-8">
        <AnimatePresence>
          {chars.length === 0 ? (
            <span className="text-slate-600 italic text-sm">Empty</span>
          ) : (
            chars.map((c) => (
              <motion.div
                key={`set-${c}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className={`px-3 py-1 rounded text-sm font-bold font-mono ${
                  phase === 'shrinking' && c === conflictChar
                    ? 'bg-rose-500/40 text-rose-300 border border-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.3)]'
                    : 'bg-blue-900/40 text-blue-300 border border-blue-600/40'
                }`}
              >
                {c}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── 主渲染器 ────────────────────────────────────
function RendererVisualizer({ currentFrame }: { currentFrame: LongestSubstringFrame }) {
  const { maxLen, phase, bestLeft, bestRight, s } = currentFrame;
  const bestStr = bestRight >= 0 ? s.slice(bestLeft, bestRight + 1) : '';

  return (
    <div className="p-4 space-y-5 flex flex-col items-center select-none w-full">
      {/* 最大长度标题 */}
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-center">
          <span className="text-xs text-slate-500 mb-1">Max Length</span>
          <motion.div
            key={maxLen}
            initial={{ scale: 1.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`text-4xl font-mono font-black ${
              phase === 'completed'
                ? 'text-emerald-400'
                : phase === 'found-max'
                  ? 'text-amber-400'
                  : 'text-slate-400'
            }`}
          >
            {maxLen}
          </motion.div>
        </div>
        {bestStr && (
          <div className="flex flex-col items-center">
            <span className="text-xs text-slate-500 mb-1">Best</span>
            <motion.div
              key={bestStr}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-lg font-mono font-bold text-emerald-300/80 bg-emerald-950/40 px-3 py-1 rounded border border-emerald-700/30"
            >
              &quot;{bestStr}&quot;
            </motion.div>
          </div>
        )}
      </div>

      {/* 字符条 */}
      <CharStrip currentFrame={currentFrame} />

      {/* 数据结构面板 */}
      <DataStructPanel currentFrame={currentFrame} />
    </div>
  );
}

function RendererCodePanel({ currentFrame }: { currentFrame: LongestSubstringFrame }) {
  const lines = currentFrame.mode === AlgorithmMode.SLIDING_WINDOW_MAP ? SW_MAP_CODE : SW_SET_CODE;
  return <CodePanel codeLines={lines} label="Code" highlightLine={currentFrame.line} />;
}

export const longestSubstringConfig: AlgorithmConfig<LongestSubstringInput, LongestSubstringFrame> =
  {
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
      if (mode === AlgorithmMode.SLIDING_WINDOW_MAP) return MAP_LEGEND;
      return SET_LEGEND;
    }) as (mode: string) => { colorBg: string; label: string }[],
    RendererVisualizer: (props) => <RendererVisualizer {...props} />,
    renderCodePanel: (props) => <RendererCodePanel {...props} />,
    generateFrames: (input, mode) => {
      switch (mode) {
        case AlgorithmMode.SLIDING_WINDOW_MAP:
          return generateMapFrames(input);
        case AlgorithmMode.SLIDING_WINDOW:
        default:
          return generateSetFrames(input);
      }
    },
  };
