'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { CodePanel } from '@/components/shared/CodePanel';
import type {
  AlgorithmConfig,
  CodePanelRenderProps,
  VisualizerRenderProps,
} from '@/types/visualizer';
import problemData from '../problem.json';
import {
  DEFAULT_INPUT,
  DP_HASH_MAP_CODE,
  HASH_SET_CODE,
  LEGEND_ITEMS,
  MODES,
  SORTING_CODE,
} from './constants';
import { generateDPHashMapFrames, generateHashSetFrames, generateSortingFrames } from './frames';
import { AlgorithmMode, LongestConsecutiveFrame, LongestConsecutiveInput } from './types';

const problem = problemData
  .flatMap((s) => s.problems)
  .find((p) => p.id === 'longest-consecutive-sequence');

function formatInput(input: LongestConsecutiveInput): string {
  return `nums=[${input.nums.join(',')}]`;
}

function parseInput(str: string): LongestConsecutiveInput | null {
  try {
    const match = str.match(/nums\s*=\s*\[([^\]]+)\]/);
    if (!match) return null;
    return {
      nums: match[1].split(',').map((s) => parseInt(s.trim())),
    };
  } catch {
    /* ignore */
  }
  return null;
}

function generateRandomInput(): LongestConsecutiveInput {
  const n = 8;
  const nums = Array.from({ length: n }, () => Math.floor(Math.random() * 20));
  return { nums };
}

function RendererVisualizer({ currentFrame }: VisualizerRenderProps<LongestConsecutiveFrame>) {
  const { mode, phase, longestStreak, streakNums, currentNum } = currentFrame;
  const streakSet = new Set(streakNums);

  const statusDisplay = (
    <div className="flex flex-col items-center gap-2">
      <div className="bg-emerald-900/50 rounded-lg px-6 py-3 border border-emerald-500">
        <span className="text-emerald-300 text-lg">最长连续序列长度: </span>
        <span className="text-emerald-400 text-2xl font-bold">{longestStreak}</span>
      </div>
      {streakNums.length > 0 && (
        <div className="text-slate-400">
          高亮序列: <span className="text-blue-400 font-mono">{streakNums.join(' → ')}</span>
        </div>
      )}
      {phase === 'done' && <div className="text-emerald-400 font-bold mt-2">计算完成!</div>}
    </div>
  );

  if (mode === AlgorithmMode.SORTING) {
    const arr = currentFrame.sortedNums || currentFrame.nums;
    return (
      <div className="flex flex-col items-center gap-8 py-6 w-full px-4">
        {statusDisplay}
        <div className="flex gap-2 flex-wrap justify-center w-full max-w-3xl">
          <AnimatePresence>
            {arr.map((num, idx) => {
              const isActive = streakSet.has(num);
              const isCurrent = idx === currentFrame.currentIndex;
              return (
                <motion.div
                  layout
                  key={`${num}-${idx}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: isActive ? 1.1 : 1 }}
                  className={`relative w-12 h-12 flex items-center justify-center rounded-lg text-white font-bold transition-colors ${
                    isCurrent
                      ? 'bg-indigo-500 ring-4 ring-indigo-300 z-10'
                      : isActive
                        ? 'bg-emerald-500'
                        : 'bg-slate-700'
                  }`}
                >
                  {num}
                  {isCurrent && (
                    <motion.div
                      layoutId="sort-pointer"
                      className="absolute -bottom-6 text-xs text-indigo-400 font-mono"
                    >
                      i={idx}
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  if (mode === AlgorithmMode.DP_HASH_MAP) {
    const dpMap = currentFrame.dpMap || new Map();
    // 展示所有出现过的数字，按大小排列展示 DP 表的状态
    const allNums = Array.from(new Set(currentFrame.nums)).sort((a, b) => a - b);

    return (
      <div className="flex flex-col items-center gap-8 py-6 w-full px-4">
        {statusDisplay}

        <div className="w-full max-w-3xl bg-slate-800/50 p-4 rounded-xl border border-slate-700 overflow-x-auto">
          <div className="text-sm text-slate-400 mb-4 flex justify-between items-center">
            <span>DP HashTable 状态维护</span>
            {currentFrame.leftLength !== undefined && currentFrame.rightLength !== undefined && (
              <span className="text-rose-400 font-mono bg-rose-500/10 px-2 py-1 rounded">
                新区间计算 = {currentFrame.leftLength} (左) + {currentFrame.rightLength} (右) + 1
              </span>
            )}
          </div>
          <div className="flex gap-3 min-w-max pb-2">
            {allNums.map((num) => {
              const dpValue = dpMap.get(num);
              const isCurrent = num === currentNum;
              const isHighlight = streakSet.has(num);
              const isBorder =
                dpValue !== undefined &&
                dpValue > 1 &&
                (!dpMap.has(num - 1) || !dpMap.has(num + 1)); // 简单判断是否是边界，用于加粗显示关键端点值

              return (
                <div key={num} className="flex flex-col gap-2 items-center">
                  <div
                    className={`w-12 h-12 flex items-center justify-center rounded-lg text-white font-bold transition-all ${
                      isCurrent
                        ? 'bg-rose-500 ring-4 ring-rose-300/50 z-10 shadow-lg scale-110'
                        : isHighlight
                          ? 'bg-emerald-500'
                          : 'bg-slate-700'
                    }`}
                  >
                    {num}
                  </div>
                  <div
                    className={`text-xs font-mono h-6 flex items-center justify-center min-w-[32px] px-1 rounded ${
                      dpValue !== undefined
                        ? isBorder
                          ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/50'
                          : 'text-slate-300 bg-slate-800'
                        : 'text-slate-600'
                    }`}
                  >
                    {dpValue !== undefined ? `len:${dpValue}` : '-'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // 默认 HASH_SET 模式
  const numSet = currentFrame.numSet || new Set(currentFrame.nums);
  const arr = currentFrame.nums; // 保持原数组顺序展示

  return (
    <div className="flex flex-col items-center gap-6 py-6 w-full px-4">
      {statusDisplay}

      <div className="w-full max-w-3xl space-y-4">
        <div className="text-sm text-slate-400 mb-2">数组遍历状态:</div>
        <div className="flex gap-2 flex-wrap">
          {arr.map((num, idx) => {
            const isHighlight = streakSet.has(num);
            const isCurrent = currentNum === num;

            return (
              <div
                key={`${num}-${idx}`}
                className={`w-12 h-12 flex items-center justify-center rounded-lg text-white font-bold transition-all ${
                  isCurrent
                    ? 'bg-teal-500 ring-4 ring-teal-300 scale-110 z-10 shadow-lg'
                    : isHighlight
                      ? 'bg-emerald-500'
                      : 'bg-slate-700'
                }`}
              >
                {num}
              </div>
            );
          })}
        </div>

        <div className="text-sm text-slate-400 mt-6 mb-2">Hash Set 底层存储 (O(1) 查找):</div>
        <div className="flex gap-2 flex-wrap items-center bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
          <span className="text-slate-500">Set {'{'}</span>
          {Array.from(numSet).map((num) => (
            <span
              key={num}
              className={`px-2 py-1 rounded text-sm ${
                currentNum === num
                  ? 'bg-teal-500/30 text-teal-200 border border-teal-500/50'
                  : 'text-slate-300 bg-slate-800'
              }`}
            >
              {num}
            </span>
          ))}
          <span className="text-slate-500">{'}'}</span>
        </div>
      </div>
    </div>
  );
}

function RendererCodePanel({
  currentFrame,
  currentMode,
}: CodePanelRenderProps<LongestConsecutiveFrame>) {
  let lines = HASH_SET_CODE;
  if (currentMode === AlgorithmMode.SORTING) lines = SORTING_CODE;
  else if (currentMode === AlgorithmMode.DP_HASH_MAP) lines = DP_HASH_MAP_CODE;

  return <CodePanel codeLines={lines} label="算法实现" highlightLine={currentFrame.line} />;
}

export const longestConsecutiveConfig: AlgorithmConfig<
  LongestConsecutiveInput,
  LongestConsecutiveFrame
> = {
  id: problem?.id || 'longest-consecutive-sequence',
  title: problem?.title || '128. 最长连续序列',
  externalLinks:
    problem?.externalLinks || 'https://leetcode.cn/problems/longest-consecutive-sequence/',
  modes: MODES,
  defaultMode: AlgorithmMode.HASH_SET,
  defaultInput: DEFAULT_INPUT,
  parseInput,
  formatInput,
  generateRandomInput,
  legend: LEGEND_ITEMS,
  RendererVisualizer: (props) => <RendererVisualizer {...props} />,
  renderCodePanel: (props) => <RendererCodePanel {...props} />,
  generateFrames: (input, mode) => {
    switch (mode) {
      case AlgorithmMode.SORTING:
        return generateSortingFrames(input);
      case AlgorithmMode.DP_HASH_MAP:
        return generateDPHashMapFrames(input);
      case AlgorithmMode.HASH_SET:
      default:
        return generateHashSetFrames(input);
    }
  },
};
