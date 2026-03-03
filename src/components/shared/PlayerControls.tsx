'use client';

import {
  ChevronFirst,
  ChevronLast,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface PlayerControlsProps {
  isPlaying: boolean;
  currentStep: number;
  totalSteps: number;
  speed: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  onPlay: () => void;
  onPause: () => void;
  onNextStep: () => void;
  onPrevStep: () => void;
  onReset: () => void;
  onGoToStep: (step: number) => void;
  onSetSpeed: (speed: number) => void;
  className?: string;
}

const speedOptions = [
  { label: '0.5x', value: 1000 },
  { label: '1x', value: 500 },
  { label: '2x', value: 250 },
  { label: '4x', value: 125 },
];

export function PlayerControls({
  isPlaying,
  currentStep,
  totalSteps,
  speed,
  isFirstStep,
  isLastStep,
  onPlay,
  onPause,
  onNextStep,
  onPrevStep,
  onReset,
  onGoToStep,
  onSetSpeed,
  className,
}: PlayerControlsProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <div className={cn('flex flex-col gap-4 p-4 rounded-lg bg-card border', className)}>
        {/* Progress bar */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-mono text-muted-foreground w-12">
            {currentStep + 1}/{totalSteps}
          </span>
          <Slider
            value={[currentStep]}
            max={totalSteps - 1}
            step={1}
            onValueChange={([value]) => onGoToStep(value)}
            className="flex-1"
          />
        </div>

        {/* Control buttons */}
        <div className="flex items-center justify-center gap-2">
          {/* Reset */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onReset}
                disabled={isFirstStep && !isPlaying}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>重置</TooltipContent>
          </Tooltip>

          {/* First step */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onGoToStep(0)}
                disabled={isFirstStep}
              >
                <ChevronFirst className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>第一步</TooltipContent>
          </Tooltip>

          {/* Previous step */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={onPrevStep} disabled={isFirstStep}>
                <SkipBack className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>上一步</TooltipContent>
          </Tooltip>

          {/* Play/Pause */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="default"
                size="icon"
                className="h-10 w-10 bg-[var(--algo-primary)] hover:bg-[var(--algo-active)]"
                onClick={isPlaying ? onPause : onPlay}
                disabled={isLastStep && !isPlaying}
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{isPlaying ? '暂停' : '播放'}</TooltipContent>
          </Tooltip>

          {/* Next step */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={onNextStep} disabled={isLastStep}>
                <SkipForward className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>下一步</TooltipContent>
          </Tooltip>

          {/* Last step */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onGoToStep(totalSteps - 1)}
                disabled={isLastStep}
              >
                <ChevronLast className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>最后一步</TooltipContent>
          </Tooltip>

          {/* Speed control */}
          <div className="ml-4 flex items-center gap-1 border-l pl-4">
            {speedOptions.map((option) => (
              <Button
                key={option.value}
                variant={speed === option.value ? 'secondary' : 'ghost'}
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => onSetSpeed(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
