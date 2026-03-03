'use client';

import React from 'react';

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
  DIVIDE_CONQUER_CODE,
  LEGEND_ITEMS,
  MODES,
  PREFIX_SUM_HASH_CODE,
  TYPED_ARRAY_CODE,
} from './constants';
import {
  generateDivideConquerFrames,
  generatePrefixSumHashFrames,
  generateTypedArrayFrames,
} from './frames';
import { AlgorithmMode, ElementState, SubarraySumFrame, SubarraySumInput } from './types';

const formatInput = (input: SubarraySumInput): string => {
  return `nums=[${input.nums.join(',')}], k=${input.k}`;
};

const parseInput = (str: string): SubarraySumInput | null => {
  try {
    const numsMatch = str.match(/nums\s*=\s*\[([^\]]*)\]/);
    const kMatch = str.match(/k\s*=\s*(-?\d+)/);

    if (numsMatch && kMatch) {
      const nums = numsMatch[1]
        .split(',')
        .map((s) => parseInt(s.trim()))
        .filter((n) => !isNaN(n));
      const k = parseInt(kMatch[1]);
      if (nums.length > 0 && !isNaN(k)) {
        return { nums, k };
      }
    }
  } catch {}
  return null;
};

const generateRandomInput = (): SubarraySumInput => {
  const len = Math.floor(Math.random() * 6) + 4;
  const nums: number[] = [];
  for (let i = 0; i < len; i++) {
    nums.push(Math.floor(Math.random() * 5) - 2); // Allow negative
  }
  const k = Math.floor(Math.random() * 5);
  return { nums, k };
};

// --- Visualization Components ---

function RendererVisualizer({ currentFrame }: VisualizerRenderProps<SubarraySumFrame>) {
  const { nums, states, map, prefixSum, targetPrefix, count, k } = currentFrame;

  if (!nums) {
    return <div className="text-slate-500">Initializing...</div>;
  }

  return (
    <div className="flex flex-col gap-8 py-8 w-full items-center">
      {/* Info Panel */}
      <div className="flex gap-8 text-sm">
        <div className="bg-slate-900 px-4 py-2 rounded-lg border border-slate-800">
          <span className="text-slate-500 mr-2">Target k:</span>
          <span className="font-mono font-bold text-white text-lg">{k}</span>
        </div>
        <div className="bg-slate-900 px-4 py-2 rounded-lg border border-slate-800">
          <span className="text-slate-500 mr-2">Current Count:</span>
          <span className="font-mono font-bold text-emerald-400 text-lg">{count}</span>
        </div>
      </div>

      {/* Array Visualization */}
      <div className="flex items-end gap-2 px-4 py-4 min-h-[100px]">
        {nums.map((val, idx) => (
          <div key={idx} className="flex flex-col items-center gap-1">
            {/* Prefix Line Logic visual could be complex, sticking to simple array highlights */}
            <div
              className={`
                        w-12 h-12 flex items-center justify-center rounded-lg border-2 font-mono text-lg font-bold transition-all duration-300
                        ${states[idx] === ElementState.ACTIVE ? 'bg-blue-500 border-blue-400 text-white shadow-lg scale-110' : 'bg-slate-800 border-slate-700 text-slate-300'}
                    `}
            >
              {val}
            </div>
            <span className="text-xs text-slate-600">{idx}</span>
          </div>
        ))}
      </div>

      {/* State Panel */}
      {prefixSum !== undefined && (
        <div className="flex items-center gap-6 bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
          <div className="flex flex-col items-center">
            <span className="text-xs text-slate-400 uppercase tracking-wider mb-1">
              Current Prefix Sum
            </span>
            <span className="text-2xl font-mono font-bold text-blue-300">{prefixSum}</span>
          </div>

          <div className="text-slate-500 font-bold text-xl">-</div>

          <div className="flex flex-col items-center">
            <span className="text-xs text-slate-400 uppercase tracking-wider mb-1">k</span>
            <span className="text-2xl font-mono font-bold text-slate-300">{k}</span>
          </div>

          <div className="text-slate-500 font-bold text-xl">=</div>

          <div className="flex flex-col items-center p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/30">
            <span className="text-xs text-indigo-400 uppercase tracking-wider mb-1">
              Target Look-up
            </span>
            <span className="text-2xl font-mono font-bold text-indigo-300">{targetPrefix}</span>
          </div>
        </div>
      )}

      {/* Hash Map Visualization */}
      {map && (
        <div className="w-full max-w-xl">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
            Prefix Sum Map
          </h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(map).map(([keyStr, val]) => {
              const key = parseInt(keyStr);
              const isTarget = key === targetPrefix;

              return (
                <div
                  key={key}
                  className={`
                                flex flex-col items-center rounded overflow-hidden border transition-all duration-300
                                ${isTarget ? 'border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)] scale-110 z-10' : 'border-slate-700 bg-slate-800'}
                            `}
                >
                  <div
                    className={`px-3 py-1 text-xs font-bold w-full text-center ${isTarget ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-750 text-indigo-300'}`}
                  >
                    {key}
                  </div>
                  <div
                    className={`px-3 py-1 w-full text-center font-mono ${isTarget ? 'bg-emerald-500/10 text-emerald-100' : ''}`}
                  >
                    {val}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function RendererCodePanel({ currentFrame, currentMode }: CodePanelRenderProps<SubarraySumFrame>) {
  const codeLines = matchMode(currentMode, {
    [AlgorithmMode.PREFIX_SUM_HASH]: PREFIX_SUM_HASH_CODE,
    [AlgorithmMode.DIVIDE_CONQUER]: DIVIDE_CONQUER_CODE,
    [AlgorithmMode.TYPED_ARRAY]: TYPED_ARRAY_CODE,
  });

  return (
    <CodePanel
      codeLines={codeLines}
      highlightLine={currentFrame.line}
      label={MODES.find((m) => m.value === currentMode)?.label || ''}
    />
  );
}

const problem = findProblemMeta(arrayData as unknown[], 'subarray-sum-equals-k')!;

export const subarraySumConfig: AlgorithmConfig<SubarraySumInput, SubarraySumFrame> = {
  id: problem.id,
  title: problem.title,
  externalLinks: problem.externalLinks,
  modes: MODES,
  defaultMode: AlgorithmMode.PREFIX_SUM_HASH,
  defaultInput: DEFAULT_INPUT,
  parseInput,
  formatInput,
  generateRandomInput,
  legend: LEGEND_ITEMS,
  RendererVisualizer: (props) => <RendererVisualizer {...props} />,
  renderCodePanel: (props) => <RendererCodePanel {...props} />,
  generateFrames: (input, mode) => {
    return matchMode(mode, {
      [AlgorithmMode.PREFIX_SUM_HASH]: () => generatePrefixSumHashFrames(input),
      [AlgorithmMode.DIVIDE_CONQUER]: () => generateDivideConquerFrames(input),
      [AlgorithmMode.TYPED_ARRAY]: () => generateTypedArrayFrames(input),
    })();
  },
};
