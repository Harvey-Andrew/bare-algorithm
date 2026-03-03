'use client';

import { ChevronLeft, ChevronRight, ListMusic, Pause, Play, RefreshCw } from 'lucide-react';

import { BackButton } from '@/components/shared/BackButton';
import { useCircularPlaylist } from './hooks/useCircularPlaylist';

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function CircularPlaylistDemo() {
  const { tracks, currentIndex, currentTrack, isPlaying, next, prev, toggle, selectTrack } =
    useCircularPlaylist();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <BackButton fallbackHref="/problems/linked-list" />
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-pink-500/20">
                <ListMusic className="w-6 h-6 text-pink-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold">循环播放列表</h1>
                <p className="text-sm text-slate-400">循环链表实现边界跳转</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* 播放器 */}
        <div className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-xl p-8 border border-pink-500/30 max-w-md mx-auto mb-8">
          <div className="text-center mb-6">
            <div className="w-32 h-32 mx-auto bg-slate-800 rounded-full flex items-center justify-center mb-4 relative">
              <ListMusic
                className={`w-16 h-16 text-pink-400 ${isPlaying ? 'animate-pulse' : ''}`}
              />
              <RefreshCw className="absolute -bottom-2 -right-2 w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold">{currentTrack?.title}</h2>
            <p className="text-slate-400">{currentTrack?.artist}</p>
            <p className="text-sm text-slate-500 mt-1">
              {formatDuration(currentTrack?.duration || 0)}
            </p>
          </div>

          {/* 控制按钮 */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={prev}
              className="p-3 bg-slate-700/50 hover:bg-slate-700 rounded-full transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={toggle}
              className="p-4 bg-pink-500 hover:bg-pink-600 rounded-full transition-colors cursor-pointer"
            >
              {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
            </button>
            <button
              onClick={next}
              className="p-3 bg-slate-700/50 hover:bg-slate-700 rounded-full transition-colors cursor-pointer"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          <div className="text-center mt-4 text-xs text-slate-500">
            曲目 {currentIndex + 1} / {tracks.length} · 循环模式
          </div>
        </div>

        {/* 播放列表 */}
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 max-w-md mx-auto">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-emerald-400" />
            循环播放列表
          </h3>
          <div className="space-y-2">
            {tracks.map((track, idx) => (
              <button
                key={track.id}
                onClick={() => selectTrack(idx)}
                className={`w-full p-3 rounded-lg flex items-center justify-between transition-colors cursor-pointer
                  ${idx === currentIndex ? 'bg-pink-500/20 border border-pink-500' : 'bg-slate-700/50 hover:bg-slate-700'}`}
              >
                <div className="text-left">
                  <div className="font-medium">{track.title}</div>
                  <div className="text-xs text-slate-400">{track.artist}</div>
                </div>
                <span className="text-sm text-slate-500">{formatDuration(track.duration)}</span>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
