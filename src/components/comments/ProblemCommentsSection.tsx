'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

import { headerBtnBase } from '@/components/shared/VisualizerHeader';
import { getProblemCommentTerm } from '@/lib/comments/problem-comment-thread';
import { cn } from '@/lib/utils';
import { GiscusComments, type GiscusDiscussionMetadata } from './GiscusComments';

interface ProblemCommentsButtonProps {
  category: string;
  problem: string;
  className?: string;
  initialCommentCount?: number;
}

const hiddenBootstrapStyle: CSSProperties = {
  width: 'min(720px, calc(100vw - 48px))',
  height: '560px',
};

function clearViewer(metadata: GiscusDiscussionMetadata | null) {
  return metadata ? { ...metadata, viewer: null } : metadata;
}

export function ProblemCommentsButton({
  category,
  problem,
  className,
  initialCommentCount,
}: ProblemCommentsButtonProps) {
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false
  );
  const [open, setOpen] = useState(false);
  const [shouldBootstrap, setShouldBootstrap] = useState(false);
  const [metadata, setMetadata] = useState<GiscusDiscussionMetadata | null>(null);

  const term = useMemo(() => getProblemCommentTerm(category, problem), [category, problem]);
  const totalMessages = metadata
    ? metadata.totalCommentCount + metadata.totalReplyCount
    : (initialCommentCount ?? 0);
  const countLabel = totalMessages > 99 ? '99+' : String(totalMessages);
  const shouldShowCount = totalMessages >= 1;
  const viewerLogin = metadata?.viewer?.login ?? null;

  useEffect(() => {
    if (!mounted || shouldBootstrap) {
      return undefined;
    }

    if (window.requestIdleCallback) {
      const idleHandle = window.requestIdleCallback(() => {
        setShouldBootstrap(true);
      });

      return () => {
        window.cancelIdleCallback?.(idleHandle);
      };
    }

    const timeoutId = window.setTimeout(() => {
      setShouldBootstrap(true);
    }, 600);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [mounted, shouldBootstrap]);

  useEffect(() => {
    if (!mounted || !open) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
    };
  }, [mounted, open]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open]);

  const openDialog = useCallback(() => {
    setShouldBootstrap(true);
    setOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setOpen(false);
  }, []);

  const buttonTitle = viewerLogin ? `已登录 GitHub：${viewerLogin}` : '需登录GitHub账号进行讨论';

  return (
    <>
      <button
        type="button"
        className={cn(
          headerBtnBase,
          'border-cyan-500 bg-cyan-500/15 text-cyan-100 hover:bg-cyan-500/25',
          className
        )}
        onClick={openDialog}
        onPointerEnter={() => setShouldBootstrap(true)}
        onFocus={() => setShouldBootstrap(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={shouldShowCount ? `讨论，当前 ${countLabel} 条` : '讨论'}
        title={buttonTitle}
        data-testid="problem-comments-button"
      >
        <span>
          讨论
          {shouldShowCount ? (
            <span className="text-[9px] sm:text-[10px]" data-testid="problem-comments-count">
              ({countLabel})
            </span>
          ) : null}
        </span>
      </button>

      {mounted
        ? createPortal(
            <>
              {shouldBootstrap && !open ? (
                <div
                  className="fixed -left-[200vw] top-0 z-[-1] overflow-hidden opacity-0 pointer-events-none"
                  style={hiddenBootstrapStyle}
                  aria-hidden="true"
                >
                  <GiscusComments
                    category={category}
                    problem={problem}
                    className="h-full min-h-[560px]"
                    onMetadataChange={setMetadata}
                    onSessionInvalid={() => {
                      setMetadata((current) => clearViewer(current));
                    }}
                  />
                </div>
              ) : null}

              {open ? (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-6">
                  <button
                    type="button"
                    className="absolute inset-0 h-full w-full cursor-default bg-slate-950/84 backdrop-blur-md"
                    onClick={closeDialog}
                    aria-label="关闭讨论弹窗遮罩"
                  />

                  <div
                    role="dialog"
                    aria-modal="true"
                    aria-label="讨论弹窗"
                    className="animate-fade-in animate-scale-in relative flex h-[calc(100dvh-1rem)] w-full max-w-[1000px] flex-col overflow-hidden rounded-[24px] border border-cyan-400/15 bg-[linear-gradient(180deg,rgba(2,6,23,0.98),rgba(2,6,23,0.94))] shadow-[0_32px_96px_rgba(2,6,23,0.72)] ring-1 ring-white/10 sm:h-[min(84dvh,760px)] sm:rounded-[30px]"
                    data-testid="problem-comments-dialog"
                  >
                    <button
                      type="button"
                      onClick={closeDialog}
                      className="absolute right-3 top-3 z-10 inline-flex size-10 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-slate-900/80 text-slate-300 transition-colors hover:bg-slate-800 hover:text-white sm:right-4 sm:top-4"
                      aria-label="关闭讨论弹窗"
                    >
                      <X className="size-4" />
                    </button>

                    <div className="flex min-h-0 flex-1 flex-col overflow-auto px-3 pb-3 pt-14 sm:px-6 sm:pb-5 sm:pt-18">
                      <div className="rounded-2xl border border-white/8 bg-slate-900/60 p-3 sm:rounded-3xl sm:p-5">
                        <GiscusComments
                          key={`${term}-dialog`}
                          category={category}
                          problem={problem}
                          className="w-full flex-1"
                          onMetadataChange={setMetadata}
                          onSessionInvalid={() => {
                            setMetadata((current) => clearViewer(current));
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </>,
            document.body
          )
        : null}

      <span className="sr-only" data-testid="problem-comments-term">
        {term}
      </span>
    </>
  );
}

export const ProblemCommentsSection = ProblemCommentsButton;
