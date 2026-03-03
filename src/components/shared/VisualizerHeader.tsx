'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ExternalLink, Layers } from 'lucide-react';
import { flushSync } from 'react-dom';

import { useIsDesktop } from '@/hooks/useIsDesktop';
import { getDefaultModeActiveColorClass } from '@/lib/visualizer/mode-colors';

// 三按钮共用基础样式
const headerBtnBase =
  'inline-flex items-center justify-center px-2 sm:px-3 py-1 text-white text-xs sm:text-base font-bold rounded-lg border transition-colors cursor-pointer shrink-0';

// --- Problem Title Component ---
interface ProblemTitleProps {
  title: string;
  externalLinks: string;
  subtitle?: string;
}

export function ProblemTitle({ title, externalLinks, subtitle = '' }: ProblemTitleProps) {
  const isDesktop = useIsDesktop();
  return (
    <a
      href={externalLinks}
      target={isDesktop ? '_blank' : undefined}
      rel="noopener noreferrer"
      className="flex items-center gap-2 hover:opacity-80 transition-opacity group min-w-0"
    >
      <div className="min-w-0">
        <h1 className="text-sm sm:text-lg lg:text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-emerald-400 to-emerald-500 leading-tight">
          {title}
          <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 text-slate-500 inline-block ml-1 align-middle" />
        </h1>
        {subtitle && (
          <p className="text-slate-500 text-xs tracking-widest uppercase font-bold">{subtitle}</p>
        )}
      </div>
    </a>
  );
}
// --- Random Button Component ---
interface RandomButtonProps {
  onClick: () => void;
}

export function RandomButton({ onClick }: RandomButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`${headerBtnBase} bg-blue-600 hover:bg-blue-500 border-blue-600`}
    >
      随机
    </button>
  );
}

// --- Input Control Component ---
interface InputControlProps {
  label?: string;
  value: string;
  placeholder?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  onSubmit?: (value: string) => void;
}

export function InputControl({
  value,
  placeholder,
  onChange,
  onBlur,
  onSubmit,
}: InputControlProps) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [draft, setDraft] = React.useState(value);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const shouldCloseFromBackdropRef = React.useRef(false);

  const openDialog = () => {
    setDraft(value);
    shouldCloseFromBackdropRef.current = false;
    setDialogOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const confirmDialog = () => {
    if (onSubmit) {
      onSubmit(draft);
    } else {
      const syntheticEvent = {
        target: { value: draft },
      } as React.ChangeEvent<HTMLInputElement>;
      flushSync(() => onChange(syntheticEvent));
      onBlur?.();
    }
    shouldCloseFromBackdropRef.current = false;
    setDialogOpen(false);
  };

  const cancelDialog = () => {
    shouldCloseFromBackdropRef.current = false;
    setDialogOpen(false);
  };

  const handleBackdropPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    shouldCloseFromBackdropRef.current = event.target === event.currentTarget;
  };

  const handleBackdropPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const shouldClose = shouldCloseFromBackdropRef.current && event.target === event.currentTarget;
    shouldCloseFromBackdropRef.current = false;

    if (shouldClose) {
      cancelDialog();
    }
  };

  return (
    <>
      <button
        onClick={openDialog}
        className={`${headerBtnBase} bg-amber-600/80 hover:bg-amber-500 border-amber-600`}
      >
        输入
      </button>

      {/* 弹框 */}
      {dialogOpen && (
        <>
          {/* 遮罩 */}
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onPointerDown={handleBackdropPointerDown}
            onPointerUp={handleBackdropPointerUp}
          />
          {/* 居中弹框 */}
          <div
            className="fixed inset-0 z-50 flex items-start pt-[15vh] sm:items-center sm:pt-0 justify-center p-4"
            onPointerDown={handleBackdropPointerDown}
            onPointerUp={handleBackdropPointerUp}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label="输入测试数据"
              className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-sm font-bold text-slate-200 mb-3">输入测试数据</h3>
              <textarea
                ref={inputRef}
                rows={5}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    confirmDialog();
                  }
                  if (e.key === 'Escape') cancelDialog();
                }}
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-sm font-mono text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder={placeholder}
              />
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={cancelDialog}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  取消
                </button>
                <button
                  onClick={confirmDialog}
                  className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors cursor-pointer"
                >
                  确定
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
interface StatDisplayProps {
  label: string;
  value: string | number;
  colorClass?: string;
}

export function StatDisplay({ label, value, colorClass = 'text-emerald-400' }: StatDisplayProps) {
  return (
    <div className="flex items-center gap-2 bg-slate-900/50 px-3 py-2 rounded-xl border border-slate-800">
      <span className="text-xs uppercase text-slate-500 font-bold">{label}</span>
      <span className={`text-xs font-mono ${colorClass}`}>{value}</span>
    </div>
  );
}

// --- Legend Component ---
interface LegendItem {
  colorBg: string; // e.g., "bg-emerald-600"
  label: string;
}

interface LegendDisplayProps {
  items: LegendItem[];
}

export function LegendDisplay({ items }: LegendDisplayProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = React.useState(false);

  React.useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current && contentRef.current) {
        setIsOverflowing(contentRef.current.scrollWidth > containerRef.current.clientWidth);
      }
    };
    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [items]);

  return (
    <div className="relative group max-w-full">
      {/* 主容器 - 允许横向滚动 */}
      <div
        ref={containerRef}
        className="inline-flex items-center bg-slate-900/50 px-3 py-2 rounded-xl border border-slate-800 overflow-x-auto max-w-full"
      >
        <div ref={contentRef} className="flex items-center gap-3 overflow-hidden">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-1.5 shrink-0">
              <div className={`w-2.5 h-2.5 rounded-sm shrink-0 ${item.colorBg}`} />
              <span className="text-xs text-slate-400 whitespace-nowrap">{item.label}</span>
            </div>
          ))}
        </div>
        {/* 省略号指示器 - 只在溢出时显示 */}
        {isOverflowing && <span className="text-slate-500 text-xs ml-1 shrink-0">...</span>}
      </div>

      {/* 悬浮显示完整图例 - 只在溢出时显示（桌面端） */}
      {isOverflowing && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg z-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl hidden lg:block">
          <div className="flex items-center gap-3 whitespace-nowrap">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <div className={`w-2.5 h-2.5 rounded-sm ${item.colorBg}`} />
                <span className="text-xs text-slate-300">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// --- Action & Mode Components ---
interface SolutionButtonProps {
  href: string;
  label?: string;
}

export function SolutionButton({ href, label = '题解' }: SolutionButtonProps) {
  const router = useRouter();
  const isDesktop = useIsDesktop();
  return (
    <button
      onClick={() => {
        if (isDesktop) {
          window.open(href, '_blank', 'noopener,noreferrer');
        } else {
          router.push(href);
        }
      }}
      className={`${headerBtnBase} bg-emerald-600/80 hover:bg-emerald-500 border-emerald-600`}
    >
      {label}
    </button>
  );
}

interface AlgorithmModeToggleProps<T extends string> {
  currentMode: T;
  onModeChange: (mode: T) => void;
  modes: {
    value: T;
    label: string;
    icon?: React.ElementType;
    activeColorClass?: string; // e.g. "bg-emerald-500 text-slate-950"
  }[];
}

export function AlgorithmModeToggle<T extends string>({
  currentMode,
  onModeChange,
  modes,
}: AlgorithmModeToggleProps<T>) {
  return (
    <div className="flex items-center gap-1 sm:gap-2 bg-slate-900/40 p-1 rounded-lg border border-slate-800 w-full sm:w-auto">
      {modes.map((m, index) => {
        const isActive = currentMode === m.value;
        const Icon = m.icon || Layers;
        return (
          <button
            key={m.value}
            onClick={() => onModeChange(m.value)}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 rounded-md text-[10px] sm:text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              isActive
                ? m.activeColorClass || getDefaultModeActiveColorClass(index)
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Icon size={12} className="sm:w-3.5 sm:h-3.5" />
            {m.label}
          </button>
        );
      })}
    </div>
  );
}
