'use client';

import { useCallback, useState } from 'react';

import { DEFAULT_TRACKS } from '../constants';
import type { Track } from '../types';

export function useCircularPlaylist() {
  const [tracks] = useState<Track[]>(DEFAULT_TRACKS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const currentTrack = tracks[currentIndex];

  const next = useCallback(() => {
    setCurrentIndex((i) => (i + 1) % tracks.length); // 循环到开头
  }, [tracks.length]);

  const prev = useCallback(() => {
    setCurrentIndex((i) => (i - 1 + tracks.length) % tracks.length); // 循环到结尾
  }, [tracks.length]);

  const play = useCallback(() => setIsPlaying(true), []);
  const pause = useCallback(() => setIsPlaying(false), []);
  const toggle = useCallback(() => setIsPlaying((p) => !p), []);

  const selectTrack = useCallback((index: number) => {
    setCurrentIndex(index);
    setIsPlaying(true);
  }, []);

  return {
    tracks,
    currentIndex,
    currentTrack,
    isPlaying,
    next,
    prev,
    play,
    pause,
    toggle,
    selectTrack,
  };
}
