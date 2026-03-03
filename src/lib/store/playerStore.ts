import { create } from 'zustand';

import type { BaseFrame } from '@/types/algorithm';

interface PlayerState {
  frames: BaseFrame[];
  currentStep: number;
  isPlaying: boolean;
  speed: number; // ms per frame
}

interface PlayerActions {
  setFrames: (frames: BaseFrame[]) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  reset: () => void;
  setSpeed: (speed: number) => void;
}

export type PlayerStore = PlayerState & PlayerActions;

export const usePlayerStore = create<PlayerStore>((set) => ({
  // State
  frames: [],
  currentStep: 0,
  isPlaying: false,
  speed: 500,

  // Actions
  setFrames: (frames) => set({ frames, currentStep: 0, isPlaying: false }),

  play: () => set({ isPlaying: true }),

  pause: () => set({ isPlaying: false }),

  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

  nextStep: () =>
    set((state) => ({
      currentStep: Math.min(state.currentStep + 1, state.frames.length - 1),
    })),

  prevStep: () =>
    set((state) => ({
      currentStep: Math.max(state.currentStep - 1, 0),
    })),

  goToStep: (step) =>
    set((state) => ({
      currentStep: Math.max(0, Math.min(step, state.frames.length - 1)),
    })),

  reset: () => set({ currentStep: 0, isPlaying: false }),

  setSpeed: (speed) => set({ speed }),
}));
