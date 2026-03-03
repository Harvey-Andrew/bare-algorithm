'use client';

import { CodePanel } from '@/components/shared/CodePanel';
import { findProblemMeta } from '@/lib/problems/problem-data';
import { AlgorithmConfig, CodePanelRenderProps, VisualizerRenderProps } from '@/types/visualizer';
import problemData from '../problem.json';
import {
  COUNT_HASH_CODE,
  DEFAULT_INPUT,
  LEGEND_ITEMS,
  MODES,
  PRIME_MULTIPLICATION_CODE,
  SORTING_CODE,
} from './constants';
import { generateGroupAnagramsFrames } from './frames';
import { AlgorithmMode, GroupAnagramsFrame, GroupAnagramsInput } from './types';

const problem = findProblemMeta(problemData as unknown[], 'group-anagrams')!;

function formatInput(input: GroupAnagramsInput): string {
  return `strs = [${input.strs.map((s) => `"${s}"`).join(', ')}]`;
}

function parseInput(input: string): GroupAnagramsInput | null {
  try {
    const raw = input.replace(/^strs\s*=\s*/, '');
    let arr;
    // Attempt standard JSON parse format mapping
    if (raw.startsWith('[')) {
      // Replace single quotes with double quotes for valid JSON
      const jsonLikeStr = raw.replace(/'/g, '"');
      arr = JSON.parse(jsonLikeStr);
    } else {
      arr = raw.split(',').map((s) => s.trim().replace(/^"|^'|"$|'$/g, ''));
    }

    if (Array.isArray(arr) && arr.length > 0 && typeof arr[0] === 'string') {
      return { strs: arr };
    }
  } catch (e) {
    console.error('Parse failed', e);
  }
  return null;
}

function generateRandomInput(): GroupAnagramsInput {
  const pools = [
    ['eat', 'tea', 'tan', 'ate', 'nat', 'bat'],
    ['cab', 'tin', 'pew', 'duh', 'may', 'ill', 'buy', 'bar', 'max', 'doc'],
    ['a'],
    ['', ''],
  ];
  return { strs: pools[Math.floor(Math.random() * pools.length)] };
}

function RendererVisualizer({
  currentFrame,
  currentMode,
}: VisualizerRenderProps<GroupAnagramsFrame>) {
  const {
    strs,
    currentIndex,
    currentStr,
    calculatedKey,
    mapState,
    message,
    sortingProcess,
    countArray,
    countIndexHighlight,
    primeAccumulation,
  } = currentFrame;

  return (
    <div className="p-4 space-y-6">
      {/* 顶部指示器面板 */}
      <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 flex justify-between items-center shadow-lg relative overflow-hidden">
        <div className="p-2 px-6 rounded-lg font-mono font-bold text-lg flex items-center justify-center border-2 border-slate-600 bg-slate-900 shadow-inner text-slate-300">
          输入字符环列
        </div>

        <div className="flex-1 px-4 flex gap-2 items-center justify-start flex-wrap max-h-24 overflow-y-auto">
          {strs.map((str, idx) => {
            const isCurrent = idx === currentIndex;
            const isProcessed = idx < currentIndex;
            return (
              <span
                key={`str-${idx}`}
                className={`px-3 py-1 rounded text-sm font-mono border transition-all
                   ${
                     isCurrent
                       ? 'bg-blue-600 text-white border-blue-400 scale-110 shadow-lg z-10 font-bold'
                       : isProcessed
                         ? 'bg-slate-700/50 text-slate-500 border-slate-600'
                         : 'bg-slate-800 text-slate-300 border-slate-600'
                   }
                 `}
              >
                &quot;{str}&quot;
              </span>
            );
          })}
        </div>
      </div>

      <div className="bg-slate-900 p-3 rounded text-slate-300 font-mono text-sm border border-slate-700 shadow-inner flex items-center gap-2">
        <span className="text-blue-400">⚡ {message}</span>
      </div>

      {/* 动态核心运算展示区 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 左侧：Key 的提取工厂 */}
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50 min-h-[300px] flex flex-col relative overflow-hidden">
          <div className="absolute top-2 left-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest z-10">
            Hash Key 提取器
          </div>

          {!currentStr && currentIndex !== -1 ? (
            <div className="flex-1 flex items-center justify-center text-slate-500 italic">
              `字母异位词` 指字母相同，但排列不同的字符串。载入...
            </div>
          ) : currentIndex === strs.length ? (
            <div className="flex-1 flex items-center justify-center text-emerald-500 font-bold text-lg uppercase tracking-widest animate-pulse">
              所有指纹提取完毕
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center mt-6 space-y-6">
              {/* Mode 1: Sorting Specific UI */}
              {currentMode === AlgorithmMode.SORTING && sortingProcess && (
                <div className="w-full max-w-sm flex flex-col items-center gap-4">
                  <div className="flex bg-slate-900 rounded p-2 border border-slate-700 space-x-1">
                    {sortingProcess.original.split('').map((char, i) => (
                      <span
                        key={`so-${i}`}
                        className="w-6 h-6 flex items-center justify-center bg-slate-800 text-slate-300 font-mono rounded text-sm"
                      >
                        {char}
                      </span>
                    ))}
                  </div>

                  {sortingProcess.arrayForm.length > 0 && (
                    <div className="text-slate-500">↓ 排序 (Sort) ↓</div>
                  )}

                  {sortingProcess.sortedForm.length > 0 && (
                    <div className="flex bg-slate-900 rounded p-2 border border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.2)] space-x-1">
                      {sortingProcess.sortedForm.map((char, i) => (
                        <span
                          key={`ss-${i}`}
                          className="w-6 h-6 flex items-center justify-center bg-blue-900/50 text-blue-300 font-mono rounded text-sm"
                        >
                          {char}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Mode 2: Count Hash Specific UI */}
              {currentMode === AlgorithmMode.COUNT_HASH && countArray && (
                <div className="w-full flex justify-center">
                  <div className="grid grid-cols-13 gap-1 p-2 bg-slate-900 rounded-lg border border-slate-700">
                    {countArray.map((cnt, idx) => {
                      const isHigh = idx === countIndexHighlight;
                      return (
                        <div
                          key={`cnt-${idx}`}
                          className={`
                               flex flex-col w-5 h-8 md:w-6 md:h-10 border text-[10px] items-center justify-center transition-all
                               ${
                                 isHigh
                                   ? 'border-blue-400 bg-blue-900 text-white scale-110 shadow origin-bottom'
                                   : cnt > 0
                                     ? 'border-emerald-600 bg-emerald-900/40 text-emerald-400'
                                     : 'border-slate-800 text-slate-600 bg-black/20'
                               }
                            `}
                        >
                          {cnt}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Mode 3: Prime Multiplication Specific UI */}
              {currentMode === AlgorithmMode.PRIME_MULTIPLICATION && primeAccumulation && (
                <div className="flex flex-col items-center gap-4 w-full px-4">
                  <div className="flex items-center gap-3 bg-slate-900/80 p-3 rounded border border-slate-700 text-2xl font-mono text-slate-300 w-full overflow-hidden">
                    <div className="text-purple-400 font-bold shrink-0">
                      × {primeAccumulation.currentFactor.toString()}n
                    </div>
                    <div className="text-slate-500">➜</div>
                    <div className="text-emerald-300 font-black truncate">
                      {primeAccumulation.currentAccumulation.toString()}n
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col items-center">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">
                  生成最终 Hash Key
                </span>
                <div
                  className={`px-6 py-2 rounded border-2 font-mono text-xl max-w-full overflow-hidden text-ellipsis whitespace-nowrap
                    ${
                      calculatedKey
                        ? 'bg-emerald-900/20 text-emerald-400 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                        : 'bg-slate-900 text-slate-600 border-slate-700 border-dashed'
                    }
                  `}
                >
                  {calculatedKey !== null ? (
                    currentMode === AlgorithmMode.PRIME_MULTIPLICATION ? (
                      <span className="text-purple-400">{String(calculatedKey)}n</span>
                    ) : (
                      `"${calculatedKey}"`
                    )
                  ) : (
                    '???'
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 右侧：Map 大仓库 */}
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50 min-h-[300px] flex flex-col relative overflow-hidden">
          <div className="absolute top-2 left-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest z-10 w-full">
            主 Map 分组归档仓
          </div>

          <div className="flex-1 mt-8 overflow-y-auto pr-2 space-y-3">
            {mapState.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-600 italic">
                Map 为空
              </div>
            ) : (
              mapState.map(({ key, group }, idx) => {
                // Highlight if it's the one we just touched
                const isTargetGroup = calculatedKey !== null && calculatedKey.toString() === key;

                return (
                  <div
                    key={`group-${idx}`}
                    className={`
                       p-3 rounded-lg border-l-4 transition-all
                       ${isTargetGroup ? 'bg-slate-700/80 border-emerald-500 shadow-md' : 'bg-slate-900/50 border-slate-600'}
                     `}
                  >
                    <div className="text-[10px] text-slate-400 font-mono mb-2 truncate" title={key}>
                      Key:{' '}
                      <span className={isTargetGroup ? 'text-emerald-400' : 'text-slate-300'}>
                        {key}
                        {currentMode === AlgorithmMode.PRIME_MULTIPLICATION ? 'n' : ''}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {group.map((member, mIdx) => {
                        const isNewMember =
                          isTargetGroup && member === currentStr && mIdx === group.length - 1;
                        return (
                          <span
                            key={`member-${idx}-${mIdx}`}
                            className={`
                                 px-2 py-0.5 rounded text-sm font-mono
                                 ${isNewMember ? 'bg-emerald-500 text-white animate-pulse' : 'bg-slate-800 text-slate-300 border border-slate-700'}
                               `}
                          >
                            {member}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function RendererCodePanel({
  currentFrame,
  currentMode,
}: CodePanelRenderProps<GroupAnagramsFrame>) {
  let code = SORTING_CODE;
  if (currentMode === AlgorithmMode.COUNT_HASH) code = COUNT_HASH_CODE;
  else if (currentMode === AlgorithmMode.PRIME_MULTIPLICATION) code = PRIME_MULTIPLICATION_CODE;

  return <CodePanel codeLines={code} label="核心实现逻辑" highlightLine={currentFrame.line} />;
}

export const groupAnagramsConfig: AlgorithmConfig<GroupAnagramsInput, GroupAnagramsFrame> = {
  id: problem.id,
  title: problem.title,
  externalLinks: problem.externalLinks,
  modes: MODES,
  defaultMode: AlgorithmMode.COUNT_HASH,
  defaultInput: DEFAULT_INPUT,
  parseInput,
  formatInput,
  generateRandomInput,
  legend: LEGEND_ITEMS,
  RendererVisualizer: (props) => <RendererVisualizer {...props} />,
  renderCodePanel: (props) => <RendererCodePanel {...props} />,
  generateFrames: (input, mode) =>
    generateGroupAnagramsFrames(input, (mode as AlgorithmMode) || AlgorithmMode.COUNT_HASH),
};
