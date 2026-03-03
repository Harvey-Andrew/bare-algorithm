'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { hasAppNavHistory } from '@/lib/nav-tracker';
import { armHistoryScrollRestore, markPendingScrollRestore } from '@/lib/scroll-restoration';

interface BackButtonProps {
  /** 无应用内导航历史时的回退路径 */
  fallbackHref: string;
  /**
   * 严格模式：始终导航到 fallbackHref，不使用 router.back()。
   * 用于 /problems/xxx → /problems、/problems → / 等需要严格控制返回层级的场景。
   */
  strict?: boolean;
  className?: string;
}

/**
 * 智能返回按钮：
 * - strict 模式：始终跳转 fallbackHref，确保返回层级正确
 * - 非 strict 模式：有应用内导航历史 → history.back()（更有助于恢复滚动位置），否则 → 导航到 fallbackHref
 */
export function BackButton({ fallbackHref, strict = false, className }: BackButtonProps) {
  const router = useRouter();

  const handleBack = useCallback(() => {
    if (strict) {
      markPendingScrollRestore(fallbackHref);
      // 严格模式：始终导航到 fallbackHref
      router.push(fallbackHref, { scroll: false });
    } else {
      // 非严格模式：优先使用原生历史返回，保留浏览器滚动恢复能力
      if (hasAppNavHistory()) {
        armHistoryScrollRestore();
        window.history.back();
      } else {
        markPendingScrollRestore(fallbackHref);
        router.push(fallbackHref, { scroll: false });
      }
    }
  }, [router, fallbackHref, strict]);

  return (
    <button
      onClick={handleBack}
      className={
        className ??
        'hidden sm:inline-flex p-2.5 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-blue-500/50 transition-colors cursor-pointer'
      }
      aria-label="返回"
    >
      <ArrowLeft className="text-slate-400 hover:text-blue-400 w-3.5 h-3.5 sm:w-5 sm:h-5" />
    </button>
  );
}
