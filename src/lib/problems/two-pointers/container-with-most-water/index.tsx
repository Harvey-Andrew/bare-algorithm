'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { CodePanel } from '@/components/shared/CodePanel';
import { findProblemMeta } from '@/lib/problems/problem-data';
import { AlgorithmConfig } from '@/types/visualizer';
import problemData from '../problem.json';
import {
  CLASSIC_CODE,
  DEFAULT_INPUT,
  FAST_SKIP_CODE,
  LEGEND_ITEMS,
  MODES,
  SORT_INDEX_CODE,
} from './constants';
import { generateContainerFrames } from './frames';
import { AlgorithmMode, ContainerFrame, ContainerInput } from './types';

const problem = findProblemMeta(problemData as unknown[], 'container-with-most-water')!;

function formatInput(input: ContainerInput): string {
  return `height = [${input.height.join(', ')}]`;
}

function parseInput(input: string): ContainerInput | null {
  const m = input.match(/\[([^\]]*)\]/);
  return m
    ? {
        height: m[1]
          .split(',')
          .map((s) => parseInt(s.trim()))
          .filter((n) => !isNaN(n)),
      }
    : null;
}

function generateRandomInput(): ContainerInput {
  const numItems = Math.floor(Math.random() * 5) + 6; // 6 to 10 items
  const height = Array.from({ length: numItems }, () => Math.floor(Math.random() * 9) + 1);
  return { height };
}

function RendererVisualizer({ currentFrame }: { currentFrame: ContainerFrame }) {
  const {
    height,
    left,
    right,
    maxArea,
    currentArea = 0,
    mode,
    sortedHeights,
    currentProcessedIdx,
    minIdx,
    maxIdx,
  } = currentFrame;
  const maxH = Math.max(...height);

  // 对于排序降维解法，左右边框变成了单纯的极值追踪范围展示
  const isLeftPointer = (i: number) => {
    if (mode === AlgorithmMode.SORT_INDEX && minIdx !== undefined) return i === minIdx;
    return i === left;
  };
  const isRightPointer = (i: number) => {
    if (mode === AlgorithmMode.SORT_INDEX && maxIdx !== undefined) return i === maxIdx;
    return i === right;
  };
  const isProcessedTarget = (i: number) =>
    mode === AlgorithmMode.SORT_INDEX && i === currentProcessedIdx;

  // 定制颜色与动画
  const primaryColorClass = 'bg-cyan-500';
  const secondaryColorClass = 'bg-purple-500';
  const targetColorClass = 'bg-emerald-500';

  const waterColorClass = 'bg-cyan-500/20 border-cyan-400';

  // 根据模式调整水位视觉 (只有经典和快速跳跃能真正"画槽水")
  const canDrawWater = mode === AlgorithmMode.CLASSIC || mode === AlgorithmMode.FAST_SKIP;
  const waterHeight = canDrawWater && left < right ? Math.min(height[left], height[right]) : 0;

  return (
    <div className="p-4 space-y-6 flex flex-col items-center select-none">
      {/* 状态指示器 */}
      <div className="flex gap-12 bg-slate-800/50 px-8 py-4 rounded-xl shadow-inner border border-slate-700/50">
        <div className="flex flex-col items-center">
          <span className="text-slate-400 text-sm font-medium tracking-wider mb-1">
            当前选区面积
          </span>
          <span
            className="text-3xl font-mono font-bold text-white tracking-widest leading-none"
            style={{ textShadow: '0 2px 10px rgba(255,255,255,0.1)' }}
          >
            {currentArea}
          </span>
        </div>
        <div className="w-px bg-slate-700 self-stretch my-1" />
        <div className="flex flex-col items-center">
          <span className="text-slate-400 text-sm font-medium tracking-wider mb-1">
            最大历史面积
          </span>
          <span className="text-3xl font-mono font-bold text-emerald-400 tracking-widest leading-none drop-shadow-md">
            {maxArea}
          </span>
        </div>
      </div>

      <div className="flex items-end h-[240px] px-4 w-full justify-center relative border-b-2 border-slate-700 pb-1">
        {/* 在背景层利用绝对定位画出一块水域范围 */}
        <AnimatePresence>
          {canDrawWater && left < right && (
            <motion.div
              layout
              className={`absolute bottom-1 border-t-2 z-0 backdrop-blur-sm transition-colors duration-300 ${waterColorClass}`}
            />
          )}
        </AnimatePresence>

        {height.map((h, i) => {
          const isL = isLeftPointer(i);
          const isR = isRightPointer(i);
          const isTarget = isProcessedTarget(i);

          return (
            <div
              key={i}
              className="flex flex-col items-center justify-end h-full relative"
              style={{ width: '40px', margin: '0 4px' }}
            >
              {canDrawWater && left < right && i >= left && i <= right && (
                <motion.div
                  animate={{ height: `${(waterHeight / maxH) * 100}%` }}
                  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                  className={`absolute bottom-0 w-full z-0 pointer-events-none transition-colors duration-300 ${waterColorClass}`}
                  style={{
                    left: 0,
                    borderTopWidth: '2px',
                  }}
                />
              )}

              {/* 针对数学降维模式的水位绘制：覆盖选中的极值跨度区间 */}
              {mode === AlgorithmMode.SORT_INDEX &&
                minIdx !== undefined &&
                maxIdx !== undefined &&
                i >= minIdx &&
                i <= maxIdx &&
                currentArea > 0 && (
                  <motion.div
                    animate={{ height: `${(height[currentProcessedIdx!] / maxH) * 100}%` }}
                    transition={{ duration: 0.3 }}
                    className={`absolute bottom-0 w-full z-0 pointer-events-none bg-emerald-500/20 border-emerald-400`}
                    style={{ left: 0, borderTopWidth: '2px' }}
                  />
                )}

              {/* 柱形实体 */}
              <motion.div
                layout
                className={`w-4 md:w-6 rounded-t z-10 shadow-lg ${
                  isTarget
                    ? targetColorClass
                    : isL
                      ? primaryColorClass
                      : isR
                        ? secondaryColorClass
                        : 'bg-slate-500'
                }`}
                style={{ height: `${(h / maxH) * 100}%` }}
                animate={{ scaleY: 1 }}
                initial={{ scaleY: 0 }}
                transition={{ type: 'spring', bounce: 0, duration: 0.6 }}
              >
                {/* 在柱子顶端显示刻度值 */}
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-slate-300 font-mono">
                  {h}
                </div>
              </motion.div>

              {/* 底部指标指示 */}
              <div className="absolute -bottom-6 w-full flex justify-center text-xs font-bold font-mono tracking-tighter">
                {isTarget && <span className="text-emerald-400">Curr</span>}
                {isL && !isTarget && (
                  <span className="text-cyan-400">
                    {mode === AlgorithmMode.SORT_INDEX ? 'MinI' : 'L'}
                  </span>
                )}
                {isL && isR && !isTarget && <span className="mx-0.5 text-slate-500">|</span>}
                {isR && !isTarget && (
                  <span className="text-purple-400">
                    {mode === AlgorithmMode.SORT_INDEX ? 'MaxI' : 'R'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 若是降维法，底部显示降序队列辅助框 */}
      {mode === AlgorithmMode.SORT_INDEX && sortedHeights && (
        <div className="w-full mt-4 bg-slate-800/60 p-3 rounded border border-slate-700">
          <h3 className="text-sm font-bold text-slate-400 mb-2">
            底层降序记录队列 Array(height, originalIdx)
          </h3>
          <div className="flex flex-wrap gap-2">
            {sortedHeights.map((item, idx) => (
              <div
                key={`sort-${idx}`}
                className={`p-1 px-2 border rounded text-xs flex flex-col items-center
                    ${item.originalIdx === currentProcessedIdx ? 'bg-emerald-500/30 border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-700/50 border-slate-600'}`}
              >
                <span className="text-amber-400 font-bold">h: {item.height}</span>
                <span className="text-slate-400 opacity-80 scale-90">idx: {item.originalIdx}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RendererCodePanel({ currentFrame }: { currentFrame: ContainerFrame }) {
  let lines = CLASSIC_CODE;
  if (currentFrame.mode === AlgorithmMode.FAST_SKIP) lines = FAST_SKIP_CODE;
  else if (currentFrame.mode === AlgorithmMode.SORT_INDEX) lines = SORT_INDEX_CODE;
  return <CodePanel codeLines={lines} label="核心代码" highlightLine={currentFrame.line} />;
}

export const containerWithMostWaterConfig: AlgorithmConfig<ContainerInput, ContainerFrame> = {
  id: problem.id,
  title: problem.title,
  externalLinks: problem.externalLinks,
  modes: MODES,
  defaultMode: AlgorithmMode.CLASSIC,
  defaultInput: DEFAULT_INPUT,
  parseInput,
  formatInput,
  generateRandomInput,
  legend: LEGEND_ITEMS,
  RendererVisualizer: (props) => <RendererVisualizer {...props} />,
  renderCodePanel: (props) => <RendererCodePanel {...props} />,
  generateFrames: (input, mode) => {
    return generateContainerFrames(input, mode || AlgorithmMode.CLASSIC);
  },
};
