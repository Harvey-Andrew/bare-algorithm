'use client';

import React from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';

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
  DEFAULT_INPUT,
  LEGEND_ITEMS,
  MODES,
  OVERWRITE_FILL_CODE,
  SORT_METHOD_CODE,
  TWO_POINTERS_CODE,
} from './constants';
import {
  generateOverwriteFillFrames,
  generateSortMethodFrames,
  generateTwoPointersFrames,
} from './frames';
import { AlgorithmMode, ElementState, MoveZeroesFrame, MoveZeroesInput } from './types';

const formatInput = (input: MoveZeroesInput): string => {
  return `nums=[${input.nums.join(',')}]`;
};

const parseInput = (str: string): MoveZeroesInput | null => {
  try {
    const match = str.match(/nums\s*=\s*\[([^\]]*)\]/);
    if (match) {
      const nums = match[1]
        .split(',')
        .map((s) => parseInt(s.trim()))
        .filter((n) => !isNaN(n));
      return { nums };
    }
  } catch {}
  return null;
};

const generateRandomInput = (): MoveZeroesInput => {
  const len = Math.floor(Math.random() * 8) + 4;
  const nums: number[] = [];
  for (let i = 0; i < len; i++) {
    nums.push(Math.random() > 0.5 ? 0 : Math.floor(Math.random() * 10) + 1);
  }
  return { nums };
};

function getStateClasses(state: ElementState) {
  switch (state) {
    case ElementState.SWAP:
      return 'bg-yellow-500 text-slate-900 border-yellow-400 scale-110 shadow-lg z-10';
    case ElementState.FAST_PTR:
      return 'bg-blue-500/20 border-blue-500 text-blue-100';
    case ElementState.SLOW_PTR:
      return 'bg-amber-500/20 border-amber-500 text-amber-100';
    case ElementState.ZERO:
      return 'bg-slate-700 text-slate-500 border-slate-600';
    case ElementState.DONE:
      return 'bg-emerald-500/20 border-emerald-500 text-emerald-100';
    default:
      return 'bg-slate-800 border-slate-700 text-slate-300';
  }
}

function RendererVisualizer({ currentFrame }: VisualizerRenderProps<MoveZeroesFrame>) {
  const { nums, states, slow, fast } = currentFrame;

  if (!nums) {
    return <div className="text-slate-500">Initializing...</div>;
  }

  return (
    <div className="flex flex-col items-center gap-8 py-8 w-full">
      <div className="flex flex-wrap justify-center gap-2 items-end min-h-[120px] px-4">
        {nums.map((val, idx) => {
          const isSlow = idx === slow;
          const isFast = idx === fast;
          const displayState = states[idx];

          return (
            <div key={idx} className="flex flex-col items-center gap-1">
              {/* Top Pointer (Write/Slow) */}
              <div className="h-8 flex items-end">
                {isSlow && (
                  <div className="text-amber-400 font-bold text-xs flex flex-col items-center animate-bounce">
                    <span className="text-[10px]">WRITE</span>
                    <ArrowDown size={14} />
                  </div>
                )}
              </div>

              <div
                className={`
                    w-12 h-12 flex items-center justify-center rounded-lg border-2 font-mono text-lg font-bold transition-all duration-300
                    ${getStateClasses(displayState)}
                    ${val === 0 && displayState === ElementState.NORMAL ? 'text-slate-600' : ''}
                 `}
              >
                {val}
              </div>

              {/* Bottom Pointer (Read/Fast) */}
              <div className="h-8 flex items-start">
                {isFast && (
                  <div className="text-blue-400 font-bold text-xs flex flex-col items-center animate-bounce">
                    <ArrowUp size={14} />
                    <span className="text-[10px]">READ</span>
                  </div>
                )}
              </div>

              <span className="text-xs text-slate-600 font-mono">{idx}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RendererCodePanel({ currentFrame, currentMode }: CodePanelRenderProps<MoveZeroesFrame>) {
  const codeLines = matchMode(currentMode, {
    [AlgorithmMode.OVERWRITE_FILL]: OVERWRITE_FILL_CODE,
    [AlgorithmMode.TWO_POINTERS]: TWO_POINTERS_CODE,
    [AlgorithmMode.SORT_METHOD]: SORT_METHOD_CODE,
  });

  return (
    <CodePanel
      codeLines={codeLines}
      highlightLine={currentFrame.line}
      label={MODES.find((m) => m.value === currentMode)?.label || ''}
    />
  );
}

const problem = findProblemMeta(arrayData as unknown[], 'move-zeroes')!;

export const moveZeroesConfig: AlgorithmConfig<MoveZeroesInput, MoveZeroesFrame> = {
  id: problem.id,
  title: problem.title,
  externalLinks: problem.externalLinks,
  modes: MODES,
  defaultMode: AlgorithmMode.OVERWRITE_FILL,
  defaultInput: DEFAULT_INPUT,
  parseInput,
  formatInput,
  generateRandomInput,
  legend: LEGEND_ITEMS,
  RendererVisualizer: (props) => <RendererVisualizer {...props} />,
  renderCodePanel: (props) => <RendererCodePanel {...props} />,
  generateFrames: (input, mode) => {
    return matchMode(mode, {
      [AlgorithmMode.OVERWRITE_FILL]: () => generateOverwriteFillFrames(input),
      [AlgorithmMode.TWO_POINTERS]: () => generateTwoPointersFrames(input),
      [AlgorithmMode.SORT_METHOD]: () => generateSortMethodFrames(input),
    })();
  },
};
