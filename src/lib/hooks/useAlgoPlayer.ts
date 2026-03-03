'use client';

import { useEffect, useRef } from 'react';

import { usePlayerStore } from '@/lib/store/playerStore';
import type { BaseFrame } from '@/types/algorithm';

interface UseAlgoPlayerOptions {
  autoPlay?: boolean;
  initialSpeed?: number;
}

export function useAlgoPlayer(frames: BaseFrame[], options: UseAlgoPlayerOptions = {}) {
  const store = usePlayerStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const initializedRef = useRef(false);

  // 记录上一次的 frames 引用用于比较
  const prevFramesRef = useRef<BaseFrame[]>([]);

  // 当 frames 变化时更新 store
  useEffect(() => {
    // 检查 frames 是否真正变化了（通过比较引用或内容）
    if (frames !== prevFramesRef.current && frames.length > 0) {
      store.setFrames(frames);
      prevFramesRef.current = frames;

      // 只在第一次初始化时应用选项
      if (!initializedRef.current) {
        if (options.initialSpeed) {
          store.setSpeed(options.initialSpeed);
        }
        if (options.autoPlay) {
          store.play();
        }
        initializedRef.current = true;
      }
    }
  }, [frames, options.autoPlay, options.initialSpeed, store]);

  // Auto-play logic
  useEffect(() => {
    if (store.isPlaying) {
      intervalRef.current = setInterval(() => {
        const { currentStep, frames: currentFrames } = usePlayerStore.getState();
        if (currentStep >= currentFrames.length - 1) {
          usePlayerStore.getState().pause();
        } else {
          usePlayerStore.getState().nextStep();
        }
      }, store.speed);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [store.isPlaying, store.speed]);

  // Computed values
  // 因为 store.setFrames 是在 useEffect 中异步执行的
  // 为防止在切换题目/重新生成数据后，第一时间拿到的是上一个题目的旧 frames，这里做同步校验
  const isSynced = store.frames === frames;
  const currentFrame = isSynced ? (store.frames[store.currentStep] ?? null) : (frames[0] ?? null);
  const currentStep = isSynced ? store.currentStep : 0;
  const totalSteps = isSynced ? store.frames.length : frames.length;
  const progress = totalSteps > 1 ? currentStep / (totalSteps - 1) : 0;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  return {
    // State
    currentFrame,
    currentStep,
    totalSteps,
    isPlaying: isSynced ? store.isPlaying : false,
    speed: store.speed,
    progress,
    isFirstStep,
    isLastStep,

    // Actions
    play: store.play,
    pause: store.pause,
    togglePlay: store.togglePlay,
    nextStep: store.nextStep,
    prevStep: store.prevStep,
    goToStep: store.goToStep,
    reset: store.reset,
    setSpeed: store.setSpeed,
  };
}
