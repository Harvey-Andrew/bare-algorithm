'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { CodePanel } from '@/components/shared/CodePanel';
import { findProblemMeta } from '@/lib/problems/problem-data';
import { AlgorithmConfig } from '@/types/visualizer';
import problemData from '../problem.json';
import {
  DEFAULT_INPUT,
  HASH_CODE,
  HASH_LEGEND,
  MODES,
  OPTIMIZED_CODE,
  OPTIMIZED_LEGEND,
  TP_CODE,
  TP_LEGEND,
} from './constants';
import { generateHashFrames, generateOptimizedFrames, generateTwoPointersFrames } from './frames';
import { AlgorithmMode, ThreeSumFrame, ThreeSumInput } from './types';

const problem = findProblemMeta(problemData as unknown[], '3sum')!;

function formatInput(input: ThreeSumInput): string {
  return `nums = [${input.nums.join(', ')}]`;
}

function parseInput(input: string): ThreeSumInput | null {
  const m = input.match(/\[([^\]]*)\]/);
  return m
    ? {
        nums: m[1]
          .split(',')
          .map((s) => parseInt(s.trim()))
          .filter((n) => !isNaN(n)),
      }
    : null;
}

function generateRandomInput(): ThreeSumInput {
  const numItems = Math.floor(Math.random() * 6) + 4; // 4 to 9 items
  // 随机生成包含正负数和0的数组
  const nums = Array.from({ length: numItems }, () => Math.floor(Math.random() * 11) - 5);
  // 对于统计优化，往往存在较多重复元素，我们可以人造一点概率
  if (Math.random() > 0.5) {
    nums.push(0, 0, 0);
  } else {
    nums.push(nums[0], nums[0]);
  }
  return { nums: nums.sort(() => 0.5 - Math.random()) }; // 稍微洗牌
}

function RendererVisualizer({ currentFrame }: { currentFrame: ThreeSumFrame }) {
  const {
    mode,
    nums,
    i,
    left,
    right,
    j,
    result,
    currentSum,
    phase,
    target,
    seen,
    counter,
    pos,
    neg,
    activeBuckets,
  } = currentFrame;

  // 根据当前执行的模式分辨谁是我们要关注的指针
  const isTP = mode === AlgorithmMode.TP;
  const isHash = mode === AlgorithmMode.HASH;
  const isOpt = mode === AlgorithmMode.OPTIMIZED;

  const p2 = isTP ? left : j;
  const p3 = isTP ? right : undefined; // Hash 没有第三个指针，它查 set

  // Hash 特用渲染: 已知缓存 Set 内的情况
  const renderHashSet = () => {
    if (!isHash || !seen) return null;
    return (
      <div className="w-full mt-4 p-4 border border-dashed border-slate-600 rounded bg-slate-900/50">
        <div className="text-xs text-slate-400 mb-2 font-mono uppercase tracking-widest">
          Hash Set (seen values)
        </div>
        <div className="flex flex-wrap gap-2 min-h-8">
          <AnimatePresence>
            {seen.length === 0 ? (
              <span className="text-slate-600 italic text-sm">Empty...</span>
            ) : (
              seen.map((s) => (
                <motion.div
                  key={`seen-${s}`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`px-3 py-1 rounded text-sm font-bold font-mono ${currentSum === s ? 'bg-indigo-500 text-white shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-slate-700 text-slate-300'}`}
                >
                  {s}
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  };

  // Optimized 特用渲染: 分桶和计数表现
  const renderOptimizedView = () => {
    if (!isOpt || !counter || !pos || !neg) return null;

    // 一个通用的渲染桶的辅助
    const renderBucket = (label: string, items: number[], themeClass: string) => (
      <div className="flex-1 min-w-[30%] flex flex-col bg-slate-900/60 p-4 rounded-xl border border-slate-700/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 py-1 px-3 bg-slate-800 text-xs text-slate-400 rounded-bl-lg font-bold">
          {label}
        </div>
        <div className="flex flex-col gap-2 mt-4 z-10">
          {items.map((val) => {
            const count = counter[String(val)] || 0;
            // 如果是被 activeBuckets 正在匹配校验的，特殊点亮
            let isChecking = false;
            if (activeBuckets) {
              // 若该值出现在需测试池中，且当前 bucket 归属正确
              isChecking = activeBuckets.includes(val);
            }

            return (
              <motion.div
                layout
                key={`bucket-${val}`}
                className={`flex items-center justify-between p-2 rounded border transition-all ${isChecking ? 'bg-emerald-900/50 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-slate-800 border-slate-700 opacity-70'} ${themeClass}`}
              >
                <span className="font-mono text-xl font-black w-8 text-center">{val}</span>
                <div className="flex items-center">
                  <span className="text-xs opacity-60 mr-2">qty:</span>
                  <span className="bg-black/30 px-2 py-0.5 rounded text-sm font-bold">{count}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );

    return (
      <div className="flex flex-col w-full gap-4 mt-2">
        {/* 原始数组统计为 Map 的动作演示（虽然是一次成型，但展示出来有对比） */}
        <div className="flex gap-1 justify-center opacity-40 scale-90">
          {nums.map((n, idx) => (
            <div
              key={idx}
              className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center font-bold text-slate-400 font-mono text-xs"
            >
              {n}
            </div>
          ))}
        </div>
        <div className="text-center w-full">
          <span className="text-xs text-slate-500 p-1 border border-slate-700 rounded-full inline-block mb-2">
            ↓ Compiled to Hash Map and Segmented ↓
          </span>
        </div>

        <div className="flex gap-4 w-full justify-between items-start">
          {renderBucket('Zero', (counter['0'] || 0) > 0 ? [0] : [], 'text-amber-400')}
          {renderBucket('Negatives', neg, 'text-rose-400')}
          {renderBucket('Positives', pos, 'text-cyan-400')}
        </div>

        {currentFrame.checkingCase && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mt-2 py-2 px-4 rounded-full bg-indigo-900/40 border border-indigo-500/30 text-indigo-300 text-sm font-semibold max-w-fit mx-auto"
          >
            {currentFrame.checkingCase}
          </motion.div>
        )}
      </div>
    );
  };

  // 获得公式面板显示，对 HASH 我们改变表达式形态： nums[i] + nums[j] + target = 0 ?
  let formulaDisplay = null;
  if (!isOpt) {
    const val1 = i !== undefined && i >= 0 ? nums[i] : '?';
    const val2 = p2 !== undefined && p2 >= 0 ? nums[p2] : '?';
    const val3 = isTP
      ? p3 !== undefined && p3 >= 0
        ? nums[p3]
        : '?'
      : target !== undefined
        ? `? (${target - (val2 as number)})`
        : '?';

    const hasCompleteValues = isTP
      ? typeof val1 === 'number' && typeof val2 === 'number' && typeof val3 === 'number'
      : typeof val1 === 'number' && typeof val2 === 'number' && target !== undefined;

    const sumDisplay = hasCompleteValues
      ? isTP
        ? currentSum
        : target
          ? (val2 as number) === target
            ? 0
            : 'x'
          : '?'
      : '?';

    let formulaBgClass = 'bg-slate-800/80 border-slate-700/50 text-slate-300';
    if (phase === 'found') {
      formulaBgClass =
        'bg-emerald-900/60 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]';
    } else if (hasCompleteValues && typeof currentSum === 'number' && isTP) {
      // TP 独有颜色倾向
      if (currentSum > 0) formulaBgClass = 'bg-rose-900/40 border-rose-500/30 text-rose-300';
      if (currentSum < 0) formulaBgClass = 'bg-sky-900/40 border-sky-500/30 text-sky-300';
    }

    formulaDisplay = (
      <motion.div
        layout
        className={`flex items-center gap-2 lg:gap-3 px-6 lg:px-8 py-4 rounded-xl shadow-lg border backdrop-blur-sm transition-all duration-500 ${formulaBgClass}`}
      >
        <div className="flex flex-col items-center">
          <span className="text-xs opacity-60 mb-1">nums[i]</span>
          <span className="text-2xl font-mono font-bold w-8 text-center">{val1}</span>
        </div>
        <span className="text-xl opacity-60 font-bold">+</span>
        <div className="flex flex-col items-center">
          <span className="text-xs opacity-60 mb-1">{isTP ? 'nums[Left]' : 'nums[j]'}</span>
          <span className="text-2xl font-mono font-bold w-8 text-center">{val2}</span>
        </div>
        <span className="text-xl opacity-60 font-bold">+</span>
        <div className="flex flex-col items-center">
          <span className="text-xs opacity-60 mb-1">{isTP ? 'nums[Right]' : 'Wait...'}</span>
          <span className="text-xl font-mono font-bold lg:w-16 text-center overflow-hidden whitespace-nowrap">
            {val3}
          </span>
        </div>
        {isTP && (
          <>
            <span className="text-2xl opacity-60 font-bold mx-2">=</span>
            <div className="flex flex-col items-center min-w-12">
              <span className="text-xs opacity-60 mb-1">Sum</span>
              <motion.span
                key={String(sumDisplay)}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-mono font-bold"
              >
                {sumDisplay}
              </motion.span>
            </div>
          </>
        )}
      </motion.div>
    );
  }

  return (
    <div className="p-4 space-y-6 flex flex-col items-center select-none w-full">
      {formulaDisplay}

      {/* 数组图示区 (对于 TP 和 HASH 提供原汁原味表现，对于 Opt提供降维呈现不展示这个) */}
      {!isOpt && (
        <div className="flex gap-2 lg:gap-3 justify-center flex-wrap px-4 min-h-[100px] items-center">
          <AnimatePresence>
            {nums.map((n, idx) => {
              const isAnchor = idx === i;
              const isP2 = idx === p2;
              const isP3 = idx === p3;

              const isActive = isAnchor || isP2 || isP3;

              let blockColor = 'bg-slate-700 text-slate-400';
              if (isAnchor)
                blockColor = 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/30';
              else if (isP2)
                blockColor = isTP
                  ? 'bg-cyan-500 text-slate-950 font-black shadow-lg shadow-cyan-500/30'
                  : 'bg-rose-500 text-white font-black';
              else if (isP3)
                blockColor = 'bg-purple-500 text-white font-black shadow-lg shadow-purple-500/30';

              const isSkipping = phase === 'skip-duplicate' && isActive;

              return (
                <motion.div
                  key={`${idx}-${n}`}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    opacity: 1,
                    scale: isActive ? 1.15 : 0.95,
                    rotateZ: isSkipping ? [0, -10, 10, -10, 0] : 0,
                    transition: { duration: isSkipping ? 0.4 : 0.3 },
                  }}
                  className={`relative flex flex-col items-center justify-center w-10 h-10 lg:w-14 lg:h-14 rounded-xl border-2 ${isActive ? 'border-transparent z-10' : 'border-slate-600 z-0'} ${blockColor} ${isSkipping ? 'opacity-50 blur-[1px]' : ''}`}
                >
                  <div className="text-base lg:text-xl font-mono">{n}</div>
                  {isActive && (
                    <motion.div
                      layoutId={`pointer-${isAnchor ? 'anchor' : isP2 ? 'p2' : 'p3'}`}
                      className="absolute -bottom-8 text-xs font-bold pointer-events-none whitespace-nowrap"
                    >
                      <span
                        className={
                          isAnchor
                            ? 'text-amber-400'
                            : isP2
                              ? isTP
                                ? 'text-cyan-400'
                                : 'text-rose-400'
                              : isTP
                                ? 'text-purple-400'
                                : 'text-indigo-400'
                        }
                      >
                        {isAnchor ? 'i' : isP2 ? (isTP ? 'Left' : 'j') : isTP ? 'Right' : 'k'}
                      </span>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {renderHashSet()}
      {renderOptimizedView()}

      {/* 结果收集箱 */}
      <div className="w-full max-w-2xl px-6 py-4 rounded-xl border border-dashed border-slate-700 bg-slate-900/30 min-h-[100px] flex flex-col pt-3 mt-4">
        <span className="text-slate-500 text-sm font-semibold mb-3 tracking-widest uppercase text-center relative">
          <span className="bg-[#0b1121] px-2">Unique Triplets Captured ({result.length})</span>
          <div className="absolute top-1/2 left-0 w-full h-px bg-slate-700 -z-10" />
        </span>

        <div className="flex flex-wrap gap-3 justify-center">
          <AnimatePresence>
            {result.length === 0 ? (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-slate-600 italic text-sm py-4"
              >
                还没有收集到等于 0 的三元组...
              </motion.span>
            ) : (
              result.map((triplet, idx) => (
                <motion.div
                  key={`triplet-${idx}`}
                  initial={{ scale: 0, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="bg-emerald-950/50 border border-emerald-800 rounded flex overflow-hidden shadow-md"
                >
                  <div className="px-3 py-1.5 text-emerald-400 font-mono text-sm font-bold border-r border-emerald-900/50">
                    {triplet[0]}
                  </div>
                  <div className="px-3 py-1.5 text-emerald-400 font-mono text-sm font-bold border-r border-emerald-900/50">
                    {triplet[1]}
                  </div>
                  <div className="px-3 py-1.5 text-emerald-400 font-mono text-sm font-bold">
                    {triplet[2]}
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function RendererCodePanel({ currentFrame }: { currentFrame: ThreeSumFrame }) {
  let lines = TP_CODE;
  if (currentFrame.mode === AlgorithmMode.HASH) lines = HASH_CODE;
  if (currentFrame.mode === AlgorithmMode.OPTIMIZED) lines = OPTIMIZED_CODE;
  return <CodePanel codeLines={lines} label="Code" highlightLine={currentFrame.line} />;
}

export const threeSumConfig: AlgorithmConfig<ThreeSumInput, ThreeSumFrame> = {
  id: problem.id,
  title: problem.title,
  externalLinks: problem.externalLinks,
  modes: MODES,
  defaultMode: AlgorithmMode.TP,
  defaultInput: DEFAULT_INPUT,
  parseInput,
  formatInput,
  generateRandomInput,
  legend: (mode: AlgorithmMode | string) => {
    if (mode === AlgorithmMode.HASH) return HASH_LEGEND;
    if (mode === AlgorithmMode.OPTIMIZED) return OPTIMIZED_LEGEND;
    return TP_LEGEND;
  },
  RendererVisualizer: (props) => <RendererVisualizer {...props} />,
  renderCodePanel: (props) => <RendererCodePanel {...props} />,
  generateFrames: (input, mode) => {
    switch (mode) {
      case AlgorithmMode.HASH:
        return generateHashFrames(input);
      case AlgorithmMode.OPTIMIZED:
        return generateOptimizedFrames(input);
      case AlgorithmMode.TP:
      default:
        return generateTwoPointersFrames(input);
    }
  },
};
