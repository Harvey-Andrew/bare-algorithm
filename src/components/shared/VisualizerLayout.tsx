'use client';

import React from 'react';

import { useOrientation } from '@/lib/hooks/useOrientation';
import { FloatingCodeBar } from './FloatingCodeBar';

interface VisualizerLayoutProps {
  /** 返回按钮 */
  headerBack?: React.ReactNode;
  /** 题目区域 */
  headerTitle?: React.ReactNode;
  /** 输入控制区域 */
  headerInput?: React.ReactNode;
  /** 随机按钮 */
  headerRandom?: React.ReactNode;
  /** 图例区域 - 用 flex-1 占剩余空间 */
  headerLegend?: React.ReactNode;
  /** 题解按钮 */
  headerComments?: React.ReactNode;
  /** 题解按钮 */
  headerSolution?: React.ReactNode;
  /** 方法切换 */
  headerMode?: React.ReactNode;
  /** Main visualizer area */
  visualizerContent: React.ReactNode;
  /** Code display area */
  codeContent: React.ReactNode;
  /** Footer area */
  footer?: React.ReactNode;
  /** 当前高亮行 */
  highlightLine?: number;
  /** 当前步骤消息 */
  message?: string;
  /** Class name */
  className?: string;
  /** Extra content */
  children?: React.ReactNode;
}

export function VisualizerLayout({
  headerBack,
  headerTitle,
  headerInput,
  headerRandom,
  headerLegend,
  headerComments,
  headerSolution,
  headerMode,
  visualizerContent,
  codeContent,
  footer,
  highlightLine = 0,
  message = '',
  className = '',
  children,
}: VisualizerLayoutProps) {
  const orientation = useOrientation();

  // 是否为移动端竖屏（使用悬浮条模式）
  const isPortrait = orientation === 'portrait';
  // 是否为移动端横屏（使用 7:5 分栏）
  const isLandscape = orientation === 'landscape';

  return (
    <div
      className={`flex flex-col h-[calc(100vh-4rem)] lg:h-[calc(100vh-6rem)] overflow-hidden ${className}`}
      style={{ height: 'calc(100dvh - 4rem)' }}
    >
      <div className="container mx-auto flex-1 flex flex-col w-full min-h-0 px-2 sm:px-4 pt-2 sm:pt-4">
        {/* Header Section */}
        <header className="flex flex-wrap sm:flex-nowrap items-center gap-1.5 sm:gap-3 mb-1.5 sm:mb-4 shrink-0">
          {/* 返回按钮 */}
          {headerBack && <div className="shrink-0">{headerBack}</div>}

          {/* 题目 - 移动端占剩余空间，三按钮靠右 */}
          {headerTitle && <div className="flex-1 sm:flex-none min-w-0 shrink-0">{headerTitle}</div>}

          {/* 题解 */}
          {headerSolution && <div className="shrink-0">{headerSolution}</div>}

          {/* 输入 */}
          {headerInput && <div className="shrink-0">{headerInput}</div>}

          {/* 随机 */}
          {headerRandom && <div className="shrink-0">{headerRandom}</div>}

          {/* 讨论 */}
          {headerComments && <div className="shrink-0">{headerComments}</div>}

          {/* 图例 - 桌面端占剩余空间 */}
          <div className="hidden sm:flex flex-1 items-center justify-center min-w-0">
            {headerLegend}
          </div>

          {/* 方法切换 */}
          {headerMode && (
            <div className="w-full sm:w-auto order-last sm:order-0 shrink-0">{headerMode}</div>
          )}
        </header>

        {/* Main Content */}
        {orientation === null ? (
          /* ===== SSR fallback：纯 CSS 响应式 ===== */
          <>
            {/* 小屏：只显示可视化区域 + 悬浮代码条 */}
            <div className="flex-1 flex flex-col gap-1.5 min-h-0 lg:hidden">
              <div className="flex-1 bg-slate-900 rounded-2xl border border-slate-800 p-2 flex items-center justify-center overflow-hidden relative min-h-0">
                {visualizerContent}
              </div>
              <div className="shrink-0">
                <FloatingCodeBar
                  highlightLine={highlightLine}
                  message={message}
                  codeContent={codeContent}
                />
              </div>
            </div>
            {/* 大屏：7:5 双栏 */}
            <main className="hidden lg:grid flex-1 grid-cols-12 gap-4 min-h-0">
              <div className="col-span-7 bg-slate-900 rounded-2xl border border-slate-800 p-2 sm:p-4 flex items-center justify-center overflow-hidden h-full relative">
                {visualizerContent}
              </div>
              <div className="col-span-5 flex flex-col h-full min-h-0 z-10">{codeContent}</div>
            </main>
          </>
        ) : isPortrait ? (
          /* ===== 竖屏移动端：可视化全屏 + 悬浮代码条 ===== */
          <div className="flex-1 flex flex-col gap-1.5 min-h-0">
            {/* 可视化区域 - 占满 */}
            <div className="flex-1 bg-slate-900 rounded-2xl border border-slate-800 p-2 flex items-center justify-center overflow-hidden relative min-h-0">
              {visualizerContent}
            </div>

            {/* 执行行悬浮条 */}
            <div className="shrink-0">
              <FloatingCodeBar
                highlightLine={highlightLine}
                message={message}
                codeContent={codeContent}
              />
            </div>
          </div>
        ) : (
          /* ===== 横屏移动端 & 桌面端：7:5 双栏 ===== */
          <main
            className={`flex-1 grid grid-cols-12 gap-2 sm:gap-4 min-h-0 ${isLandscape ? '' : ''}`}
          >
            {/* Visualizer Panel */}
            <div className="col-span-7 bg-slate-900 rounded-2xl border border-slate-800 p-2 sm:p-4 flex items-center justify-center overflow-hidden h-full relative">
              {visualizerContent}
            </div>

            {/* Code Panel */}
            <div className="col-span-5 flex flex-col h-full min-h-0 z-10">{codeContent}</div>
          </main>
        )}

        {/* Footer Section */}
        {footer && <footer className="mt-1 sm:mt-2 shrink-0">{footer}</footer>}
      </div>

      {/* Extra children (Modals, overlays, etc) */}
      {children}
    </div>
  );
}
