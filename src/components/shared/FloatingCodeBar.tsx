'use client';

import React, { createContext, useState } from 'react';
import { ChevronUp, Code } from 'lucide-react';

/** 当 CodePanel 在 FloatingCodeBar 抽屉内时，通过此 Context 获取额外信息 */
export const FloatingCodeBarContext = createContext<{
  highlightLine: number;
  onClose: () => void;
} | null>(null);

interface FloatingCodeBarProps {
  /** 当前高亮行号 (0-indexed) */
  highlightLine: number;
  /** LOG 消息 */
  message: string;
  /** 完整代码面板 ReactNode */
  codeContent: React.ReactNode;
}

/**
 * 执行行悬浮条 - 竖屏移动端专用
 * 底部紧凑显示当前执行状态，点击展开完整代码面板
 */
export function FloatingCodeBar({ highlightLine, message, codeContent }: FloatingCodeBarProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      {/* 悬浮条 - 始终显示 */}
      <button
        onClick={() => setExpanded(true)}
        className="w-full flex items-center gap-2 px-3 py-2 bg-slate-800/95 backdrop-blur border border-slate-700 rounded-lg cursor-pointer hover:border-purple-500/50 transition-colors"
      >
        <Code size={14} className="text-purple-400 shrink-0" />
        <span className="text-xs font-mono text-purple-300 font-bold shrink-0">
          L{highlightLine + 1}
        </span>
        <span className="text-xs text-slate-400 truncate flex-1 text-left">{message}</span>
        <ChevronUp size={14} className="text-slate-500 shrink-0" />
      </button>

      {/* 展开的代码面板 - 底部抽屉 */}
      {expanded && (
        <>
          {/* 遮罩 */}
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setExpanded(false)}
          />
          {/* 抽屉 */}
          <div
            className="fixed left-0 right-0 bottom-0 z-50 h-[70vh] flex flex-col bg-slate-900 border-t border-slate-700 rounded-t-2xl"
            style={{ animation: 'slideUp 0.25s ease-out' }}
          >
            {/* 代码内容 - 通过 Context 注入行号和关闭按钮到 CodePanel 的 header */}
            <FloatingCodeBarContext.Provider
              value={{ highlightLine, onClose: () => setExpanded(false) }}
            >
              <div className="flex-1 overflow-auto min-h-0">{codeContent}</div>
            </FloatingCodeBarContext.Provider>
          </div>
        </>
      )}
    </>
  );
}
