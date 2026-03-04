'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { getProblemCommentTerm } from '@/lib/comments/problem-comment-thread';
import { cn } from '@/lib/utils';

export interface GiscusViewer {
  login: string;
  avatarUrl: string;
  url: string;
}

export interface GiscusDiscussionMetadata {
  totalCommentCount: number;
  totalReplyCount: number;
  reactionCount: number;
  viewer: GiscusViewer | null;
}

const GISCUS_SESSION_KEY = 'giscus-session';

interface GiscusCommentsProps {
  category: string;
  problem: string;
  className?: string;
  onMetadataChange?: (metadata: GiscusDiscussionMetadata) => void;
  onSessionInvalid?: () => void;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isViewer(value: unknown): value is GiscusViewer {
  return (
    isRecord(value) &&
    typeof value.login === 'string' &&
    typeof value.avatarUrl === 'string' &&
    typeof value.url === 'string'
  );
}

function parseMetadata(value: unknown): GiscusDiscussionMetadata | null {
  if (!isRecord(value) || !('discussion' in value)) {
    return null;
  }

  const discussion = value.discussion;
  if (discussion === null) {
    return {
      totalCommentCount: 0,
      totalReplyCount: 0,
      reactionCount: 0,
      viewer: isViewer(value.viewer) ? value.viewer : null,
    };
  }

  if (!isRecord(discussion)) {
    return null;
  }

  if (
    typeof discussion.totalCommentCount !== 'number' ||
    typeof discussion.totalReplyCount !== 'number' ||
    typeof discussion.reactionCount !== 'number'
  ) {
    return null;
  }

  return {
    totalCommentCount: discussion.totalCommentCount,
    totalReplyCount: discussion.totalReplyCount,
    reactionCount: discussion.reactionCount,
    viewer: isViewer(value.viewer) ? value.viewer : null,
  };
}

function parseError(value: unknown): string | null {
  if (!isRecord(value) || typeof value.error !== 'string') {
    return null;
  }

  return value.error;
}

export function GiscusComments({
  category,
  problem,
  className,
  onMetadataChange,
  onSessionInvalid,
}: GiscusCommentsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const term = useMemo(() => getProblemCommentTerm(category, problem), [category, problem]);
  const [failedTerm, setFailedTerm] = useState<string | null>(null);
  const [loadedTerm, setLoadedTerm] = useState<string | null>(null);
  const [timedOutTerm, setTimedOutTerm] = useState<string | null>(null);
  const [retryNonce, setRetryNonce] = useState(0);
  const loaded = loadedTerm === term;
  const loadError = failedTerm === term;
  const isSlowLoading = !loaded && timedOutTerm === term;

  const repo = process.env.NEXT_PUBLIC_GISCUS_REPO ?? '';
  const repoId = process.env.NEXT_PUBLIC_GISCUS_REPO_ID ?? '';
  const discussionCategory = process.env.NEXT_PUBLIC_GISCUS_CATEGORY ?? '';
  const categoryId = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID ?? '';
  const lang = process.env.NEXT_PUBLIC_GISCUS_LANG ?? 'zh-CN';

  const isConfigured = Boolean(repo && repoId && discussionCategory && categoryId);

  // 生产环境使用自定义主题 CSS（giscus.app 可访问的公网 URL）
  // 本地开发 giscus.app 无法从 localhost 获取 CSS，回退为内置 dark 主题
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? '';
  const giscusTheme =
    siteUrl && !siteUrl.includes('localhost') ? `${siteUrl}/giscus-custom.css` : 'dark';

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://giscus.app' || !isRecord(event.data)) {
        return;
      }

      const payload = event.data.giscus;
      if (!isRecord(payload)) {
        return;
      }

      const metadata = parseMetadata(payload);

      if (metadata) {
        setFailedTerm(null);
        setTimedOutTerm(null);
        setLoadedTerm(term);
        onMetadataChange?.(metadata);
        return;
      }

      const error = parseError(payload);
      if (!error) {
        // 兜底：部分无讨论线程场景不会返回 metadata，收到任意有效消息也视为可显示
        setTimedOutTerm(null);
        setLoadedTerm(term);
        return;
      }

      if (/discussion|not[\s-]?found|no[\s-]?discussion/i.test(error)) {
        setFailedTerm(null);
        setTimedOutTerm(null);
        setLoadedTerm(term);
        return;
      }

      if (/session|credentials|unauthorized|forbidden/i.test(error)) {
        onSessionInvalid?.();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onMetadataChange, onSessionInvalid, term]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !isConfigured) {
      return undefined;
    }

    try {
      const savedSession = window.localStorage.getItem(GISCUS_SESSION_KEY);
      if (savedSession !== null) {
        JSON.parse(savedSession);
      }
    } catch {
      window.localStorage.removeItem(GISCUS_SESSION_KEY);
    }

    container.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.onerror = () => {
      setFailedTerm(term);
    };

    const attributes = {
      'data-repo': repo,
      'data-repo-id': repoId,
      'data-category': discussionCategory,
      'data-category-id': categoryId,
      'data-mapping': 'specific',
      'data-term': term,
      'data-strict': '1',
      'data-reactions-enabled': '0',
      'data-emit-metadata': '1',
      'data-input-position': 'top',
      'data-theme': giscusTheme,
      'data-lang': lang,
    } as const;

    Object.entries(attributes).forEach(([key, value]) => {
      script.setAttribute(key, value);
    });

    container.appendChild(script);

    // 超时仅提示“加载较慢”，不直接判定失败
    const timeoutId = window.setTimeout(() => {
      setTimedOutTerm(term);
    }, 12_000);

    return () => {
      container.innerHTML = '';
      window.clearTimeout(timeoutId);
    };
  }, [
    categoryId,
    discussionCategory,
    giscusTheme,
    isConfigured,
    lang,
    repo,
    repoId,
    retryNonce,
    term,
  ]);

  const handleRetry = useCallback(() => {
    setFailedTerm(null);
    setTimedOutTerm(null);
    setLoadedTerm(null);
    setRetryNonce((value) => value + 1);
  }, []);

  if (!isConfigured) {
    return (
      <div className="flex h-full items-center justify-center rounded-[24px] border border-amber-400/20 bg-amber-500/10 p-4 sm:p-5">
        <div className="max-w-md text-center">
          <p className="text-sm font-semibold text-amber-100">讨论系统尚未完成配置</p>
          <p className="mt-2 text-sm leading-6 text-amber-50/75">
            需要先配置 giscus 的仓库和分类参数，讨论弹窗才能真正连接到 GitHub Discussions。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative w-full', className)}>
      {/* 自定义骨架屏 loading / 加载失败提示 */}
      {!loaded && (
        <div className="absolute inset-0 z-10 flex flex-col gap-4 overflow-hidden rounded-xl bg-slate-950/96 p-1">
          {/* 加载失败提示 */}
          {loadError ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3">
              <div className="text-center">
                <p className="text-sm font-semibold text-rose-200">讨论模块加载失败</p>
                <p className="mt-1.5 text-xs leading-5 text-slate-400">
                  网络连接异常或 giscus 服务暂时不可用
                </p>
              </div>
              <button
                type="button"
                onClick={handleRetry}
                className="rounded-lg border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:bg-white/10"
              >
                重新加载
              </button>
            </div>
          ) : (
            <>
              {isSlowLoading ? (
                <div className="z-30 flex items-center justify-between rounded-lg border border-white/10 bg-slate-950/70 px-3 py-2 text-xs text-slate-300">
                  <span>讨论加载较慢，正在重试连接…</span>
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-slate-100 transition-colors hover:bg-white/10"
                  >
                    重新加载
                  </button>
                </div>
              ) : null}
              {/* shimmer 光扫叠加层 */}
              <div
                className="pointer-events-none absolute inset-0 z-20"
                style={{
                  background:
                    'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 40%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.06) 60%, transparent 100%)',
                  backgroundSize: '200% 100%',
                  animation: 'giscus-shimmer 1.8s ease-in-out infinite',
                }}
              />
              {/* 模拟输入框骨架 */}
              <div className="space-y-3">
                <div className="h-4 w-28 rounded bg-white/8" />
                <div className="h-28 w-full rounded-xl border border-white/6 bg-white/5" />
                <div className="flex justify-end">
                  <div className="h-9 w-32 rounded-lg bg-white/8" />
                </div>
              </div>
              {/* 分隔线 */}
              <div className="h-px w-full bg-white/6" />
              {/* 模拟评论骨架 */}
              <div className="flex gap-3">
                <div className="size-8 shrink-0 rounded-full bg-white/8" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-36 rounded bg-white/10" />
                  <div className="h-3 w-full rounded bg-white/6" />
                  <div className="h-3 w-3/4 rounded bg-white/6" />
                </div>
              </div>
            </>
          )}
        </div>
      )}
      {/* giscus iframe 容器 */}
      <div
        ref={containerRef}
        className={cn(
          'giscus-host w-full overflow-hidden transition-opacity duration-300',
          loaded ? 'opacity-100' : 'opacity-0'
        )}
        data-testid="giscus-comments-container"
      />
    </div>
  );
}
