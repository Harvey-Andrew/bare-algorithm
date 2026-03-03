'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { CodePanel } from '@/components/shared/CodePanel';
import { findProblemMeta } from '@/lib/problems/problem-data';
import { AlgorithmConfig } from '@/types/visualizer';
import problemData from '../problem.json';
import { BF_CODE, DEFAULT_INPUT, MODES, TP_CODE, TP_LEGEND } from './constants';
import { generateBruteForceFrames, generateTwoPointersFrames } from './frames';
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
  const { height, left, right, maxArea, currentArea = 0, mode } = currentFrame;
  const maxH = Math.max(...height);

  const isLeftPointer = (i: number) => i === left;
  const isRightPointer = (i: number) => i === right;

  // 根据当前左右指针，计算水面的高度（只在它们都在界内且 left < right 时绘制）
  const waterHeight = left < right ? Math.min(height[left], height[right]) : 0;

  // 定制颜色与动画
  const primaryColorClass = mode === AlgorithmMode.BRUTE_FORCE ? 'bg-rose-500' : 'bg-cyan-500';
  const secondaryColorClass =
    mode === AlgorithmMode.BRUTE_FORCE ? 'bg-purple-500' : 'bg-purple-500';
  const waterColorClass =
    mode === AlgorithmMode.BRUTE_FORCE
      ? 'bg-indigo-500/30 border-indigo-500/50'
      : 'bg-cyan-500/20 border-cyan-400';

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
        {/* 我们在背景层利用绝对定位画出一块水域范围（仅当 left < right 时） */}
        <AnimatePresence>
          {left < right && (
            <motion.div
              layout
              className={`absolute bottom-1 border-t-2 z-0 backdrop-blur-sm transition-colors duration-300 ${waterColorClass}`}
              style={
                {
                  // 宽度占比计算：由于柱子占比例但有 gap，用简化的 flex 手段可能很难精准，所以我们在每一列都附着一层半透明层来替代绝对宽度绘制
                }
              }
              // 其实更简单且抗挤压的方式是：在遍历 height 生成柱子时，判断它是否在容器内部，如果是，渲染一块额外的水填充 div。
              // 这里只是个占位符，真正的水池我们在柱子遍历里呈现。
            />
          )}
        </AnimatePresence>

        {height.map((h, i) => {
          const isL = isLeftPointer(i);
          const isR = isRightPointer(i);

          return (
            <div
              key={i}
              className="flex flex-col items-center justify-end h-full relative"
              style={{ width: '40px', margin: '0 4px' }}
            >
              {/* 当柱子作为容器左边界或右边界，或者是中间区块时，绘制对应的水幕（右边界画左半边水幕，左边界画右半边，中间全涂满）
                  为了简化视觉效果，我们只描绘每个柱底部的 "水" 高度 */}
              {left < right && i >= left && i <= right && (
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

              {/* 柱形实体 */}
              <motion.div
                layout
                className={`w-4 md:w-6 rounded-t z-10 shadow-lg ${
                  isL ? primaryColorClass : isR ? secondaryColorClass : 'bg-slate-500'
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
                {isL && (
                  <span
                    className={`text-${mode === AlgorithmMode.BRUTE_FORCE ? 'rose' : 'cyan'}-400`}
                  >
                    {mode === AlgorithmMode.BRUTE_FORCE ? 'i' : 'L'}
                  </span>
                )}
                {isL && isR && <span className="mx-0.5 text-slate-500">|</span>}
                {isR && (
                  <span className="text-purple-400">
                    {mode === AlgorithmMode.BRUTE_FORCE ? 'j' : 'R'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RendererCodePanel({ currentFrame }: { currentFrame: ContainerFrame }) {
  const lines = currentFrame.mode === AlgorithmMode.BRUTE_FORCE ? BF_CODE : TP_CODE;
  return <CodePanel codeLines={lines} label="Code" highlightLine={currentFrame.line} />;
}

export const containerWithMostWaterConfig: AlgorithmConfig<ContainerInput, ContainerFrame> = {
  id: problem.id,
  title: problem.title,
  externalLinks: problem.externalLinks,
  modes: MODES,
  defaultMode: AlgorithmMode.TP,
  defaultInput: DEFAULT_INPUT,
  parseInput,
  formatInput,
  generateRandomInput,
  legend: TP_LEGEND, // 若需动态请在渲染时处理，或定义新类型
  RendererVisualizer: (props) => <RendererVisualizer {...props} />,
  renderCodePanel: (props) => <RendererCodePanel {...props} />,
  generateFrames: (input, mode) => {
    switch (mode) {
      case AlgorithmMode.BRUTE_FORCE:
        return generateBruteForceFrames(input);
      case AlgorithmMode.TP:
      default:
        return generateTwoPointersFrames(input);
    }
  },
};
