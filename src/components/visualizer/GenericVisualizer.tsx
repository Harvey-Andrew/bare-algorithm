'use client';

import React, { useCallback, useRef, useState } from 'react';

import { BackButton } from '@/components/shared/BackButton';
import { ScaleToFit } from '@/components/shared/ScaleToFit';
import { UnifiedPlayerControls } from '@/components/shared/UnifiedPlayerControls';
import {
  AlgorithmModeToggle,
  InputControl,
  LegendDisplay,
  ProblemTitle,
  RandomButton,
  SolutionButton,
} from '@/components/shared/VisualizerHeader';
import { VisualizerLayout } from '@/components/shared/VisualizerLayout';
import { useAlgoPlayer } from '@/lib/hooks/useAlgoPlayer';
import type { BaseFrame } from '@/types/algorithm';
import type { AlgorithmConfig } from '@/types/visualizer';

interface GenericVisualizerProps<TInput, TFrame extends BaseFrame> {
  config: AlgorithmConfig<TInput, TFrame>;
  category?: string;
  problemSlug?: string;
}

export function GenericVisualizer<TInput, TFrame extends BaseFrame>({
  config,
  category,
  problemSlug,
}: GenericVisualizerProps<TInput, TFrame>) {
  const [mode, setMode] = useState(config.defaultMode);
  const [input, setInput] = useState<TInput>(config.defaultInput);
  const [inputValue, setInputValue] = useState(config.formatInput(config.defaultInput));

  // 生成帧
  const frames = React.useMemo(() => {
    return config.generateFrames(input, mode);
  }, [config, input, mode]);

  // 播放器状态
  const {
    currentFrame,
    currentStep,
    totalSteps,
    isPlaying,
    speed,
    play,
    pause,
    nextStep,
    prevStep,
    reset,
    goToStep,
    setSpeed,
  } = useAlgoPlayer(frames);

  // 容器尺寸
  const containerRef = useRef<HTMLDivElement>(null);

  // 处理器
  const handlePlay = useCallback(() => play(), [play]);
  const handlePause = useCallback(() => pause(), [pause]);
  const handleNextStep = useCallback(() => nextStep(), [nextStep]);
  const handlePrevStep = useCallback(() => prevStep(), [prevStep]);
  const handleReset = useCallback(() => reset(), [reset]);
  const handleGoToStep = useCallback((step: number) => goToStep(step), [goToStep]);
  const handleSetSpeed = useCallback((newSpeed: number) => setSpeed(newSpeed), [setSpeed]);

  const handleModeChange = (newMode: string) => {
    setMode(newMode);
    reset();
    pause();
  };

  const handleInputTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputBlur = () => {
    const parsed = config.parseInput(inputValue);
    if (parsed) {
      setInput(parsed);
      setInputValue(config.formatInput(parsed));
      reset();
      pause();
    } else {
      setInputValue(config.formatInput(input));
    }
  };

  // 弹框确定时直接传入最终字符串，不依赖 inputValue 闭包
  const handleInputSubmit = (value: string) => {
    const parsed = config.parseInput(value);
    if (parsed) {
      setInput(parsed);
      setInputValue(config.formatInput(parsed));
      reset();
      pause();
    }
  };

  const handleRandom = useCallback(() => {
    const newInput = config.generateRandomInput();
    setInput(newInput);
    setInputValue(config.formatInput(newInput));
    reset();
    pause();
  }, [config, reset, pause]);

  const handleCellClick = useCallback(
    (r: number, c: number) => {
      if (currentStep !== 0 || isPlaying) return;
      // 针对二维数组类型的输入进行处理
      if (Array.isArray(input) && Array.isArray(input[0])) {
        const newInput = (input as unknown as string[][]).map((row, ri) =>
          row.map((cell, ci) => (ri === r && ci === c ? (cell === '1' ? '0' : '1') : cell))
        ) as unknown as TInput;
        setInput(newInput);
        setInputValue(config.formatInput(newInput));
        reset();
      }
    },
    [currentStep, isPlaying, input, config, reset]
  );

  if (!currentFrame) {
    return <div className="flex items-center justify-center h-64 text-slate-500">加载中...</div>;
  }

  // 构建题解页面链接
  const backHref = category ? `/problems/${category}` : '/problems';
  const solutionHref =
    category && problemSlug
      ? `/problems/${category}/${problemSlug}/solution`
      : `/problems/${config.id}/solution`;

  return (
    <VisualizerLayout
      headerBack={<BackButton fallbackHref={backHref} />}
      headerTitle={<ProblemTitle title={config.title} externalLinks={config.externalLinks} />}
      headerInput={
        <InputControl
          value={inputValue}
          onChange={handleInputTextChange}
          onBlur={handleInputBlur}
          onSubmit={handleInputSubmit}
          placeholder="输入..."
        />
      }
      headerRandom={<RandomButton onClick={handleRandom} />}
      headerLegend={
        <LegendDisplay
          items={typeof config.legend === 'function' ? config.legend(mode) : config.legend}
        />
      }
      headerSolution={!config.hideSolution ? <SolutionButton href={solutionHref} /> : null}
      headerMode={
        <AlgorithmModeToggle
          currentMode={mode}
          onModeChange={handleModeChange}
          modes={config.modes}
        />
      }
      visualizerContent={
        <div
          ref={containerRef}
          className="w-full h-full flex items-center justify-center p-2 sm:p-4 lg:p-0"
        >
          <ScaleToFit>
            {config.RendererVisualizer({
              currentFrame: currentFrame as TFrame,
              currentStep,
              isPlaying,
              currentMode: mode,
              onCellClick: handleCellClick,
              containerRef,
            })}
          </ScaleToFit>
        </div>
      }
      codeContent={config.renderCodePanel({
        currentFrame: currentFrame as TFrame,
        currentMode: mode,
      })}
      highlightLine={currentFrame.line}
      message={currentFrame.message}
      footer={
        <div className="space-y-1.5">
          <div className="hidden lg:flex p-2 bg-slate-900/50 border border-slate-800 rounded-lg items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shrink-0" />
            <p className="text-xs font-mono text-slate-300 truncate">
              <span className="text-slate-500 mr-2">LOG:</span>
              {currentFrame.message}
            </p>
          </div>

          <UnifiedPlayerControls
            currentStep={currentStep}
            totalSteps={totalSteps}
            isPlaying={isPlaying}
            speed={speed}
            onPlay={handlePlay}
            onPause={handlePause}
            onNextStep={handleNextStep}
            onPrevStep={handlePrevStep}
            onReset={handleReset}
            onGoToStep={handleGoToStep}
            onSetSpeed={handleSetSpeed}
          />
        </div>
      }
    />
  );
}
