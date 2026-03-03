'use client';

import React from 'react';
import { ArrowUp } from 'lucide-react';

import { CodePanel } from '@/components/shared/CodePanel';
import { findProblemMeta } from '@/lib/problems/problem-data';
import { matchMode } from '@/lib/utils';
import type {
  AlgorithmConfig,
  CodePanelRenderProps,
  VisualizerRenderProps,
} from '@/types/visualizer';
import arrayData from '../problem.json';
import {
  BRUTE_FORCE_CODE,
  DEFAULT_INPUT,
  HASH_MAP_CODE,
  LEGEND_ITEMS,
  MODES,
  TWO_POINTER_CODE,
} from './constants';
import {
  generateBruteForceFrames,
  generateHashMapFrames,
  generateTwoPointerFrames,
} from './frames';
import { AlgorithmMode, ElementState, TwoSumFrame, TwoSumInput } from './types';

/**
 * 格式化输入
 */
const formatInput = (input: TwoSumInput): string => {
  return `nums=[${input.nums.join(',')}], target=${input.target}`;
};

/**
 * 解析输入
 */
const parseInput = (str: string): TwoSumInput | null => {
  try {
    const numsMatch = str.match(/nums\s*=\s*\[([^\]]*)\]/);
    const targetMatch = str.match(/target\s*=\s*(-?\d+)/);

    if (numsMatch && targetMatch) {
      const nums = numsMatch[1]
        .split(',')
        .map((s) => parseInt(s.trim()))
        .filter((n) => !isNaN(n));
      const target = parseInt(targetMatch[1]);
      if (nums.length > 0 && !isNaN(target)) {
        return { nums, target };
      }
    }
  } catch (e) {
    console.warn('Parse failed', e);
  }
  return null;
};

/**
 * 生成随机输入
 */
const generateRandomInput = (): TwoSumInput => {
  const len = Math.floor(Math.random() * 6) + 4; // 4-10
  const nums = Array.from({ length: len }, () => Math.floor(Math.random() * 20) - 5);
  const idx1 = Math.floor(Math.random() * len);
  let idx2 = Math.floor(Math.random() * len);
  while (idx2 === idx1) idx2 = Math.floor(Math.random() * len);

  const target = nums[idx1] + nums[idx2];
  return { nums, target };
};

/**
 * 样式辅助函数
 */
function getStateClasses(state: ElementState) {
  switch (state) {
    case ElementState.ACTIVE:
      return 'bg-blue-500/20 border-blue-500 text-blue-100 shadow-[0_0_10px_rgba(59,130,246,0.3)]';
    case ElementState.MATCH:
      return 'bg-emerald-500 text-white border-emerald-400 scale-110 shadow-[0_0_15px_rgba(16,185,129,0.5)] z-10';
    case ElementState.VISITED:
      return 'bg-slate-700/50 text-slate-400 border-slate-600';
    case ElementState.LEFT_POINTER:
      return 'bg-cyan-500/20 border-cyan-500 text-cyan-100 shadow-[0_0_12px_rgba(6,182,212,0.4)]';
    case ElementState.RIGHT_POINTER:
      return 'bg-rose-500/20 border-rose-500 text-rose-100 shadow-[0_0_12px_rgba(244,63,94,0.4)]';
    default:
      return 'bg-slate-800 border-slate-700 text-slate-300';
  }
}

/**
 * 可视化渲染器
 */
function RendererVisualizer({ currentFrame }: VisualizerRenderProps<TwoSumFrame>) {
  const { nums, target, states, i, j, left, right, map, complement, currentSum, sortedPairs } =
    currentFrame;

  if (!nums) {
    return <div className="text-slate-500">Initializing...</div>;
  }

  return (
    <div className="flex flex-col items-center gap-8 py-8 w-full">
      {/* Info Bar */}
      <div className="flex gap-12 text-lg bg-slate-900/50 px-8 py-3 rounded-full border border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium">Target:</span>
          <span className="font-bold font-mono text-red-400 text-xl">{target}</span>
        </div>
        {complement !== undefined && (
          <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-300">
            <span className="text-slate-400 font-medium">Looking for:</span>
            <span className="font-bold font-mono text-indigo-400 text-xl">{complement}</span>
          </div>
        )}
        {currentSum !== undefined && (
          <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-300">
            <span className="text-slate-400 font-medium">Current Sum:</span>
            <span
              className={`font-bold font-mono text-xl ${
                currentSum === target ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {currentSum}
            </span>
          </div>
        )}
      </div>

      {/* Array Visualization */}
      <div className="flex flex-wrap justify-center gap-3 items-end min-h-[100px] px-4">
        {nums.map((val, idx) => {
          const isI = idx === i;
          const isJ = idx === j;
          return (
            <div key={idx} className="flex flex-col items-center gap-2 group">
              {/* Indices/Pointers */}
              <div className="h-8 relative w-full flex justify-center">
                {isI && (
                  <div className="absolute bottom-0 text-blue-400 font-bold text-xs flex flex-col items-center animate-bounce">
                    <span className="text-[10px] uppercase tracking-wider mb-0.5">Cur</span>
                    <ArrowUp size={16} />
                  </div>
                )}
                {isJ && (
                  <div className="absolute bottom-0 text-purple-400 font-bold text-xs flex flex-col items-center animate-bounce delay-75">
                    <span className="text-[10px] uppercase tracking-wider mb-0.5">Scan</span>
                    <ArrowUp size={16} />
                  </div>
                )}
                {states[idx] === ElementState.LEFT_POINTER && (
                  <div className="absolute bottom-0 text-cyan-400 font-bold text-xs flex flex-col items-center animate-bounce">
                    <span className="text-[10px] uppercase tracking-wider mb-0.5">L</span>
                    <ArrowUp size={16} />
                  </div>
                )}
                {states[idx] === ElementState.RIGHT_POINTER && (
                  <div className="absolute bottom-0 text-rose-400 font-bold text-xs flex flex-col items-center animate-bounce delay-75">
                    <span className="text-[10px] uppercase tracking-wider mb-0.5">R</span>
                    <ArrowUp size={16} />
                  </div>
                )}
              </div>

              {/* Box */}
              <div
                className={`
                              w-14 h-14 flex items-center justify-center rounded-xl border-2 font-mono text-xl font-bold transition-all duration-300
                              ${getStateClasses(states[idx])}
                           `}
              >
                {val}
              </div>

              {/* Index Label */}
              <span className="text-xs text-slate-600 font-mono group-hover:text-slate-400 transition-colors">
                {idx}
              </span>
            </div>
          );
        })}
      </div>

      {/* Hash Map Visualization */}
      {map && Object.keys(map).length > 0 && (
        <div className="w-full max-w-2xl animate-in slide-in-from-bottom-4 fade-in duration-500">
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-medium text-slate-400 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
              Hash Map Table
            </h3>

            <div className="flex gap-4 flex-wrap">
              {Object.entries(map).map(([key, value]) => (
                <div
                  key={key}
                  className="flex flex-col items-center bg-slate-800 rounded-lg border border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="px-3 py-1.5 bg-slate-750 w-full text-center border-b border-slate-700">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest">
                      Key
                    </span>
                    <div className="font-mono font-bold text-indigo-300">{key}</div>
                  </div>
                  <div className="px-3 py-1.5 w-full text-center bg-slate-800">
                    <div className="font-mono text-emerald-300">{value}</div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest">
                      Idx
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sorted Array Visualization (Two Pointer) */}
      {sortedPairs && sortedPairs.length > 0 && (
        <div className="w-full max-w-2xl animate-in slide-in-from-bottom-4 fade-in duration-500">
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-medium text-slate-400 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
              排序后数组 (保留原始下标)
            </h3>

            <div className="flex gap-3 flex-wrap justify-center">
              {sortedPairs.map((pair, sortedIdx) => {
                const isLeft = sortedIdx === left;
                const isRight = sortedIdx === right;
                return (
                  <div
                    key={sortedIdx}
                    className={`flex flex-col items-center bg-slate-800 rounded-lg border overflow-hidden shadow-sm transition-all duration-300 ${
                      isLeft
                        ? 'border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                        : isRight
                          ? 'border-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                          : 'border-slate-700'
                    }`}
                  >
                    <div className="px-4 py-2 text-center">
                      <div className="font-mono font-bold text-lg text-slate-200">{pair.val}</div>
                    </div>
                    <div className="px-4 py-1 bg-slate-700/50 w-full text-center">
                      <span className="text-[10px] text-slate-500">原下标: </span>
                      <span className="font-mono text-amber-300 text-sm">{pair.idx}</span>
                    </div>
                    {(isLeft || isRight) && (
                      <div
                        className={`px-2 py-0.5 w-full text-center text-xs font-bold ${
                          isLeft ? 'bg-cyan-500/20 text-cyan-300' : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {isLeft ? 'Left' : 'Right'}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * 代码面板渲染器
 */
function RendererCodePanel({ currentFrame, currentMode }: CodePanelRenderProps<TwoSumFrame>) {
  const codeLines = matchMode(currentMode, {
    [AlgorithmMode.BRUTE_FORCE]: BRUTE_FORCE_CODE,
    [AlgorithmMode.HASH_MAP]: HASH_MAP_CODE,
    [AlgorithmMode.TWO_POINTER]: TWO_POINTER_CODE,
  });

  return (
    <CodePanel
      codeLines={codeLines}
      highlightLine={currentFrame.line}
      label={MODES.find((m) => m.value === currentMode)?.label || ''}
    />
  );
}

// 获取题目元数据
const problem = findProblemMeta(arrayData as unknown[], 'two-sum')!;

export const twoSumConfig: AlgorithmConfig<TwoSumInput, TwoSumFrame> = {
  id: problem.id,
  title: problem.title,
  externalLinks: problem.externalLinks,
  modes: MODES,
  defaultMode: AlgorithmMode.HASH_MAP, // Recommend optimized solution by default
  defaultInput: DEFAULT_INPUT,
  parseInput,
  formatInput,
  generateRandomInput,
  legend: LEGEND_ITEMS,
  RendererVisualizer: (props) => <RendererVisualizer {...props} />,
  renderCodePanel: (props) => <RendererCodePanel {...props} />,
  generateFrames: (input, mode) => {
    return matchMode(mode, {
      [AlgorithmMode.BRUTE_FORCE]: () => generateBruteForceFrames(input),
      [AlgorithmMode.HASH_MAP]: () => generateHashMapFrames(input),
      [AlgorithmMode.TWO_POINTER]: () => generateTwoPointerFrames(input),
    })();
  },
};
