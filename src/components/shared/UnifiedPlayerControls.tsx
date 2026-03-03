'use client';

import { useEffect } from 'react';
import {
  ChevronFirst,
  ChevronLast,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
} from 'lucide-react';

import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface UnifiedPlayerControlsProps {
  /** 当前步骤索引 */
  currentStep: number;
  /** 总步骤数 */
  totalSteps: number;
  /** 是否正在播放 */
  isPlaying: boolean;
  /** 当前速度 (ms) */
  speed: number;
  /** 是否为第一步 */
  isFirstStep?: boolean;
  /** 是否为最后一步 */
  isLastStep?: boolean;
  /** 播放回调 */
  onPlay: () => void;
  /** 暂停回调 */
  onPause: () => void;
  /** 下一步回调 */
  onNextStep: () => void;
  /** 上一步回调 */
  onPrevStep: () => void;
  /** 重置回调 */
  onReset: () => void;
  /** 跳转到指定步骤回调 */
  onGoToStep: (step: number) => void;
  /** 设置速度回调 */
  onSetSpeed: (speed: number) => void;
  /** 类名 */
  className?: string;
}

const speedOptions = [
  { label: '0.5x', value: 1000, mobileHidden: true },
  { label: '1x', value: 500, mobileHidden: false },
  { label: '2x', value: 250, mobileHidden: false },
  { label: '4x', value: 125, mobileHidden: true },
];

export function UnifiedPlayerControls({
  currentStep,
  totalSteps,
  isPlaying,
  speed,
  isFirstStep = currentStep === 0,
  isLastStep = currentStep === totalSteps - 1,
  onPlay,
  onPause,
  onNextStep,
  onPrevStep,
  onReset,
  onGoToStep,
  onSetSpeed,
  className,
}: UnifiedPlayerControlsProps) {
  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 忽略输入框内的按键
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case ' ':
          e.preventDefault();
          if (isPlaying) {
            onPause();
          } else {
            onPlay();
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          onPrevStep();
          break;
        case 'ArrowRight':
          e.preventDefault();
          onNextStep();
          break;
        case 'Home':
          e.preventDefault();
          onGoToStep(0);
          break;
        case 'End':
          e.preventDefault();
          onGoToStep(totalSteps - 1);
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          onReset();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, totalSteps, onPlay, onPause, onPrevStep, onNextStep, onGoToStep, onReset]);

  return (
    <div
      className={cn(
        'flex flex-col gap-1 sm:gap-2 p-1.5 sm:p-2 rounded-lg bg-slate-900/80 border border-slate-800',
        className
      )}
    >
      {/* 进度条 */}
      <div className="flex items-center gap-2 px-1">
        <span className="text-xs sm:text-xs font-mono text-slate-400 w-10 sm:w-12 text-right shrink-0">
          {currentStep + 1}/{totalSteps}
        </span>
        <Slider
          value={[currentStep]}
          max={Math.max(totalSteps - 1, 0)}
          step={1}
          onValueChange={([value]) => onGoToStep(value)}
          className="flex-1"
        />
      </div>

      {/* 控制按钮 */}
      <div className="flex items-center justify-center gap-0.5 sm:gap-1.5 relative h-9 sm:h-8">
        {/* 重置 */}
        <button
          onClick={onReset}
          disabled={isFirstStep && !isPlaying}
          className="p-2 sm:p-2.5 text-slate-400 hover:text-slate-200 disabled:text-slate-600 disabled:cursor-not-allowed cursor-pointer transition-colors min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center"
          title="重置 (R)"
        >
          <RotateCcw size={16} />
        </button>

        {/* 第一步 */}
        <button
          onClick={() => onGoToStep(0)}
          disabled={isFirstStep}
          className="p-2 sm:p-2.5 text-slate-400 hover:text-slate-200 disabled:text-slate-600 disabled:cursor-not-allowed cursor-pointer transition-colors min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center"
          title="第一步 (Home)"
        >
          <ChevronFirst size={16} />
        </button>

        {/* 上一步 */}
        <button
          onClick={onPrevStep}
          disabled={isFirstStep}
          className="p-2 sm:p-2.5 text-slate-400 hover:text-slate-200 disabled:text-slate-600 disabled:cursor-not-allowed cursor-pointer transition-colors min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center"
          title="上一步 (←)"
        >
          <SkipBack size={16} />
        </button>

        {/* 播放/暂停 */}
        <button
          onClick={isPlaying ? onPause : onPlay}
          disabled={isLastStep && !isPlaying}
          className="p-2 sm:p-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed cursor-pointer text-white rounded-md transition-all flex items-center justify-center w-9 h-9 sm:w-8 sm:h-8 mx-0.5 sm:mx-1"
          title={isPlaying ? '暂停 (空格)' : '播放 (空格)'}
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
        </button>

        {/* 下一步 */}
        <button
          onClick={onNextStep}
          disabled={isLastStep}
          className="p-2 sm:p-2.5 text-slate-400 hover:text-slate-200 disabled:text-slate-600 disabled:cursor-not-allowed cursor-pointer transition-colors min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center"
          title="下一步 (→)"
        >
          <SkipForward size={16} />
        </button>

        {/* 最后一步 */}
        <button
          onClick={() => onGoToStep(totalSteps - 1)}
          disabled={isLastStep}
          className="p-2 sm:p-2.5 text-slate-400 hover:text-slate-200 disabled:text-slate-600 disabled:cursor-not-allowed cursor-pointer transition-colors min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center"
          title="最后一步 (End)"
        >
          <ChevronLast size={16} />
        </button>

        {/* 分隔线 */}
        <div className="w-px h-4 bg-slate-700 mx-0.5 sm:mx-1" />

        {/* 速度选项 */}
        <div className="flex items-center gap-0">
          {speedOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onSetSpeed(option.value)}
              className={cn(
                'px-1.5 py-0.5 text-xs font-medium cursor-pointer transition-all shrink-0',
                option.mobileHidden && 'hidden sm:inline-flex',
                speed === option.value
                  ? 'text-white font-bold'
                  : 'text-slate-500 hover:text-slate-300'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* 快捷键提示 - 右侧 */}
        <div className="absolute right-2 text-xs text-slate-500 hidden lg:block tracking-tight pointer-events-none">
          空格=播放 | ←→=步进 | Home/End=首末 | R=重置
        </div>
      </div>
    </div>
  );
}
