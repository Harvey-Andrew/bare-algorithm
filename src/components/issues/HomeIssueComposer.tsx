'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from 'react';
import { ChevronDown, CircleAlert, CircleCheck, SquarePen, X } from 'lucide-react';
import { createPortal } from 'react-dom';

import { cn } from '@/lib/utils';

type IssueType =
  | 'bug'
  | 'feature'
  | 'question'
  | 'content'
  | 'ui'
  | 'performance'
  | 'algorithm'
  | 'docs';

interface HomeIssueComposerProps {
  className?: string;
  ariaLabel?: string;
  compact?: boolean;
}

interface CreatedIssue {
  issueNumber: number;
  issueUrl: string;
}

interface FormState {
  type: IssueType;
  title: string;
  description: string;
  reproduction: string;
  expected: string;
  contact: string;
  website: string;
}

interface TurnstileRenderOptions {
  sitekey: string;
  theme?: 'light' | 'dark' | 'auto';
  callback?: (token: string) => void;
  'expired-callback'?: () => void;
  'error-callback'?: () => void;
}

interface TurnstileApi {
  render: (container: HTMLElement, options: TurnstileRenderOptions) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId?: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const ISSUE_TYPE_OPTIONS: Array<{ value: IssueType; label: string; icon: string; desc: string }> = [
  { value: 'bug', label: 'Bug 问题', icon: '🐛', desc: '程序崩溃、报错、行为异常' },
  { value: 'feature', label: '功能建议', icon: '💡', desc: '希望新增的功能或改进' },
  { value: 'question', label: '使用问题', icon: '❓', desc: '使用方式、操作流程相关' },
  { value: 'content', label: '题目内容反馈', icon: '📝', desc: '题目描述有误或缺失' },
  { value: 'algorithm', label: '算法错误', icon: '⚙️', desc: '算法逻辑或帧生成结果不正确' },
  { value: 'ui', label: 'UI / 样式问题', icon: '🎨', desc: '界面显示异常、暗色模式适配' },
  { value: 'performance', label: '性能问题', icon: '🚀', desc: '动画卡顿、加载缓慢' },
  { value: 'docs', label: '文档 / 题解改进', icon: '📖', desc: '题解内容补充或纠错' },
];

const INITIAL_FORM: FormState = {
  type: 'feature',
  title: '',
  description: '',
  reproduction: '',
  expected: '',
  contact: '',
  website: '',
};

function normalizeText(value: string): string {
  return value.replace(/\r\n/g, '\n').trim();
}

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '';
const TURNSTILE_SCRIPT_SRC =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
const TURNSTILE_SCRIPT_ID = 'cf-turnstile-script';

let turnstileScriptPromise: Promise<void> | null = null;

function ensureTurnstileScript(): Promise<void> {
  if (typeof window === 'undefined' || window.turnstile) {
    return Promise.resolve();
  }

  if (turnstileScriptPromise) {
    return turnstileScriptPromise;
  }

  const scriptPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.getElementById(TURNSTILE_SCRIPT_ID) as HTMLScriptElement | null;
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true });
      existingScript.addEventListener(
        'error',
        () => reject(new Error('turnstile script failed to load')),
        { once: true }
      );
      return;
    }

    const script = document.createElement('script');
    script.id = TURNSTILE_SCRIPT_ID;
    script.src = TURNSTILE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('turnstile script failed to load'));
    document.head.appendChild(script);
  }).catch((error) => {
    turnstileScriptPromise = null;
    throw error;
  });

  turnstileScriptPromise = scriptPromise;
  return scriptPromise;
}

export function HomeIssueComposer({
  className,
  ariaLabel = '站内提 Issue',
  compact = false,
}: HomeIssueComposerProps) {
  const turnstileEnabled = Boolean(TURNSTILE_SITE_KEY);
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false
  );
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdIssue, setCreatedIssue] = useState<CreatedIssue | null>(null);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileReady, setTurnstileReady] = useState(!turnstileEnabled);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const turnstileContainerRef = useRef<HTMLDivElement>(null);
  const turnstileWidgetIdRef = useRef<string | null>(null);

  const titleLength = form.title.trim().length;
  const descriptionLength = form.description.trim().length;

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

  useEffect(() => {
    if (!errorMessage) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setErrorMessage(null);
    }, 4500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [errorMessage]);

  useEffect(() => {
    if (!createdIssue) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setCreatedIssue(null);
    }, 5000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [createdIssue]);

  // 点击下拉框外部关闭
  useEffect(() => {
    if (!typeDropdownOpen) return undefined;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setTypeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [typeDropdownOpen]);

  useEffect(() => {
    if (!open || !turnstileEnabled) {
      return undefined;
    }

    let cancelled = false;

    const mountTurnstile = async () => {
      setTurnstileReady(false);
      setTurnstileToken('');

      try {
        await ensureTurnstileScript();
        if (cancelled) {
          return;
        }

        const turnstileApi = window.turnstile;
        const container = turnstileContainerRef.current;
        if (!turnstileApi || !container) {
          setTurnstileReady(false);
          return;
        }

        if (turnstileWidgetIdRef.current) {
          turnstileApi.remove(turnstileWidgetIdRef.current);
          turnstileWidgetIdRef.current = null;
        }

        const widgetId = turnstileApi.render(container, {
          sitekey: TURNSTILE_SITE_KEY,
          theme: 'dark',
          callback: (token: string) => {
            setTurnstileToken(token);
            setTurnstileReady(true);
          },
          'expired-callback': () => {
            setTurnstileToken('');
          },
          'error-callback': () => {
            setTurnstileToken('');
            setTurnstileReady(false);
          },
        });

        turnstileWidgetIdRef.current = widgetId;
        setTurnstileReady(true);
      } catch {
        if (!cancelled) {
          setTurnstileReady(false);
          setErrorMessage('机器人验证组件加载失败，请稍后重试。');
        }
      }
    };

    void mountTurnstile();

    return () => {
      cancelled = true;
      const widgetId = turnstileWidgetIdRef.current;
      if (widgetId && window.turnstile) {
        window.turnstile.remove(widgetId);
      }
      turnstileWidgetIdRef.current = null;
      setTurnstileToken('');
    };
  }, [open, turnstileEnabled]);

  const openDialog = useCallback(() => {
    setOpen(true);
    setErrorMessage(null);
    setCreatedIssue(null);
  }, []);

  const closeDialog = useCallback(() => {
    setOpen(false);
    setTypeDropdownOpen(false);
  }, []);

  const handleInputChange = useCallback(
    <K extends keyof FormState>(field: K, value: FormState[K]) => {
      setForm((current) => ({ ...current, [field]: value }));
    },
    []
  );

  const resetForm = useCallback(() => {
    setForm(INITIAL_FORM);
    setCreatedIssue(null);
    setErrorMessage(null);
    setTurnstileToken('');
    if (turnstileEnabled && turnstileWidgetIdRef.current && window.turnstile) {
      window.turnstile.reset(turnstileWidgetIdRef.current);
    }
  }, [turnstileEnabled]);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setErrorMessage(null);
      setCreatedIssue(null);

      const payload = {
        type: form.type,
        title: normalizeText(form.title),
        description: normalizeText(form.description),
        reproduction: normalizeText(form.reproduction),
        expected: normalizeText(form.expected),
        contact: normalizeText(form.contact),
        website: normalizeText(form.website),
        turnstileToken,
      };

      if (!payload.title) {
        setErrorMessage('请填写标题字段。');
        return;
      }

      if (!payload.description) {
        setErrorMessage('请填写问题描述字段。');
        return;
      }

      if (payload.title.length < 6) {
        setErrorMessage('标题至少需要 6 个字符。');
        return;
      }

      if (payload.description.length < 12) {
        setErrorMessage('请补充更完整的问题描述（至少 12 个字符）。');
        return;
      }

      if (turnstileEnabled && !payload.turnstileToken) {
        setErrorMessage(turnstileReady ? '请先完成人机验证。' : '人机验证尚未就绪，请稍后重试。');
        return;
      }

      setSubmitting(true);

      try {
        const response = await fetch('/api/issues', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const data = (await response.json().catch(() => null)) as
          | CreatedIssue
          | { error?: string }
          | null;

        if (!response.ok) {
          setErrorMessage(data && 'error' in data && data.error ? data.error : '创建 Issue 失败。');
          return;
        }

        if (!data || !('issueNumber' in data) || !('issueUrl' in data)) {
          setErrorMessage('Issue 创建成功，但返回数据格式异常。');
          return;
        }

        setCreatedIssue({
          issueNumber: data.issueNumber,
          issueUrl: data.issueUrl,
        });
        setForm(INITIAL_FORM);
      } catch {
        setErrorMessage('网络异常，暂时无法创建 Issue，请稍后重试。');
      } finally {
        if (turnstileEnabled && turnstileWidgetIdRef.current && window.turnstile) {
          window.turnstile.reset(turnstileWidgetIdRef.current);
          setTurnstileToken('');
        }
        setSubmitting(false);
      }
    },
    [form, turnstileEnabled, turnstileReady, turnstileToken]
  );

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        className={cn('cursor-pointer', className)}
        aria-label={ariaLabel}
      >
        {compact ? <SquarePen className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : '站内提 Issue'}
      </button>

      {mounted
        ? createPortal(
            open ? (
              <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-6">
                <button
                  type="button"
                  className="absolute inset-0 h-full w-full bg-slate-950/82 backdrop-blur-md"
                  onClick={closeDialog}
                  aria-label="关闭 issue 弹窗"
                />

                <div
                  role="dialog"
                  aria-modal="true"
                  aria-label="站内提 issue"
                  className="animate-fade-in animate-scale-in relative flex h-[min(92dvh,860px)] w-full max-w-[860px] flex-col overflow-hidden rounded-[22px] border border-cyan-300/18 bg-[linear-gradient(180deg,rgba(2,6,23,0.98),rgba(2,6,23,0.95))] shadow-[0_28px_88px_rgba(2,6,23,0.72)] ring-1 ring-white/10"
                >
                  <button
                    type="button"
                    onClick={closeDialog}
                    className="absolute right-3 top-3 z-10 inline-flex size-10 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-slate-900/80 text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
                    aria-label="关闭 issue 弹窗"
                  >
                    <X className="size-4" />
                  </button>

                  {errorMessage ? (
                    <div
                      role="alert"
                      aria-live="assertive"
                      className="pointer-events-none absolute left-1/2 top-4 z-20 w-[min(calc(100%-2.5rem),520px)] -translate-x-1/2"
                    >
                      <div className="pointer-events-auto flex items-start gap-2 rounded-xl border border-rose-400/35 bg-rose-500/15 px-3 py-2.5 shadow-[0_12px_32px_rgba(127,29,29,0.28)] backdrop-blur-sm">
                        <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" />
                        <p className="flex-1 text-sm leading-5 text-rose-100">{errorMessage}</p>
                        <button
                          type="button"
                          onClick={() => setErrorMessage(null)}
                          className="inline-flex size-5 cursor-pointer items-center justify-center rounded-md text-rose-200/85 transition-colors hover:bg-rose-500/20 hover:text-rose-100"
                          aria-label="关闭错误提示"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {createdIssue ? (
                    <div
                      role="status"
                      aria-live="polite"
                      className="pointer-events-none absolute left-1/2 top-4 z-20 w-[min(calc(100%-2.5rem),520px)] -translate-x-1/2"
                    >
                      <div className="pointer-events-auto flex items-start gap-2 rounded-xl border border-emerald-400/35 bg-emerald-500/15 px-3 py-2.5 shadow-[0_12px_32px_rgba(6,78,59,0.28)] backdrop-blur-sm">
                        <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                        <div className="flex-1 text-sm leading-5 text-emerald-100">
                          <p>已成功创建 Issue #{createdIssue.issueNumber}</p>
                          <a
                            href={createdIssue.issueUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-1 inline-block text-emerald-200 underline decoration-emerald-300/60 underline-offset-2 hover:text-emerald-100"
                          >
                            查看 Issue 详情 ↗
                          </a>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCreatedIssue(null)}
                          className="inline-flex size-5 cursor-pointer items-center justify-center rounded-md text-emerald-200/85 transition-colors hover:bg-emerald-500/20 hover:text-emerald-100"
                          aria-label="关闭成功提示"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : null}

                  <div className="overflow-auto px-4 pb-5 pt-6 sm:px-6 sm:pb-6 sm:pt-7">
                    <div className="pr-8 sm:pr-12">
                      <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-100 sm:text-3xl">
                        提交到 GitHub Issue
                      </h2>
                    </div>

                    <form
                      onSubmit={handleSubmit}
                      noValidate
                      className="mt-5 space-y-4 sm:space-y-5"
                    >
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2 text-sm" ref={dropdownRef}>
                          <span className="text-slate-300">Issue 类型</span>
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setTypeDropdownOpen((prev) => !prev)}
                              className="flex w-full items-center justify-between rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2.5 text-left text-slate-100 outline-none transition-colors hover:border-slate-500 focus:border-cyan-400"
                            >
                              <span className="flex items-center gap-2">
                                <span className="text-base leading-none">
                                  {ISSUE_TYPE_OPTIONS.find((o) => o.value === form.type)?.icon}
                                </span>
                                <span>
                                  {ISSUE_TYPE_OPTIONS.find((o) => o.value === form.type)?.label}
                                </span>
                              </span>
                              <ChevronDown
                                className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${typeDropdownOpen ? 'rotate-180' : ''}`}
                              />
                            </button>

                            {typeDropdownOpen && (
                              <div className="absolute left-0 top-[calc(100%+6px)] z-30 w-full overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-[0_16px_48px_rgba(0,0,0,0.45)]">
                                <div className="max-h-[260px] overflow-y-auto py-1">
                                  {ISSUE_TYPE_OPTIONS.map((option) => (
                                    <button
                                      key={option.value}
                                      type="button"
                                      onClick={() => {
                                        handleInputChange('type', option.value);
                                        setTypeDropdownOpen(false);
                                      }}
                                      className={cn(
                                        'flex w-full items-start gap-3 px-3 py-2.5 text-left transition-colors hover:bg-cyan-500/10',
                                        form.type === option.value && 'bg-cyan-500/15'
                                      )}
                                    >
                                      <span className="mt-0.5 text-base leading-none">
                                        {option.icon}
                                      </span>
                                      <div className="flex-1 min-w-0">
                                        <div
                                          className={cn(
                                            'text-sm font-medium',
                                            form.type === option.value
                                              ? 'text-cyan-300'
                                              : 'text-slate-200'
                                          )}
                                        >
                                          {option.label}
                                        </div>
                                        <div className="text-xs text-slate-500 mt-0.5 truncate">
                                          {option.desc}
                                        </div>
                                      </div>
                                      {form.type === option.value && (
                                        <span className="mt-1 text-xs text-cyan-400">✓</span>
                                      )}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <label className="space-y-2 text-sm">
                          <span className="text-slate-300">联系方式（可选）</span>
                          <input
                            type="text"
                            value={form.contact}
                            onChange={(event) => handleInputChange('contact', event.target.value)}
                            placeholder="例如：GitHub 用户名 / 邮箱"
                            maxLength={120}
                            className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2.5 text-slate-100 outline-none transition-colors placeholder:text-slate-500 focus:border-cyan-400"
                          />
                        </label>
                      </div>

                      <label className="space-y-2 text-sm">
                        <div className="flex items-center justify-between text-slate-300">
                          <span>标题</span>
                          <span className="text-xs text-slate-500">{titleLength}/256</span>
                        </div>
                        <input
                          type="text"
                          value={form.title}
                          onChange={(event) => handleInputChange('title', event.target.value)}
                          placeholder="请简要描述问题或建议"
                          maxLength={256}
                          className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2.5 text-slate-100 outline-none transition-colors placeholder:text-slate-500 focus:border-cyan-400"
                        />
                      </label>

                      <label className="space-y-2 text-sm">
                        <div className="flex items-center justify-between text-slate-300">
                          <span>问题描述</span>
                          <span className="text-xs text-slate-500">{descriptionLength}/65536</span>
                        </div>
                        <textarea
                          value={form.description}
                          onChange={(event) => handleInputChange('description', event.target.value)}
                          placeholder="请说明当前遇到的问题、场景或改进建议"
                          rows={5}
                          maxLength={65536}
                          className="w-full resize-y rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2.5 text-slate-100 outline-none transition-colors placeholder:text-slate-500 focus:border-cyan-400"
                        />
                      </label>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="space-y-2 text-sm">
                          <span className="text-slate-300">复现步骤（可选）</span>
                          <textarea
                            value={form.reproduction}
                            onChange={(event) =>
                              handleInputChange('reproduction', event.target.value)
                            }
                            placeholder="1. 进入页面... 2. 点击..."
                            rows={4}
                            maxLength={3000}
                            className="w-full resize-y rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2.5 text-slate-100 outline-none transition-colors placeholder:text-slate-500 focus:border-cyan-400"
                          />
                        </label>

                        <label className="space-y-2 text-sm">
                          <span className="text-slate-300">期望结果（可选）</span>
                          <textarea
                            value={form.expected}
                            onChange={(event) => handleInputChange('expected', event.target.value)}
                            placeholder="你希望它表现为..."
                            rows={4}
                            maxLength={3000}
                            className="w-full resize-y rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2.5 text-slate-100 outline-none transition-colors placeholder:text-slate-500 focus:border-cyan-400"
                          />
                        </label>
                      </div>

                      {turnstileEnabled ? (
                        <div className="space-y-2 text-sm">
                          <span className="text-slate-300">人机验证</span>
                          <div className="rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-3">
                            <div ref={turnstileContainerRef} />
                          </div>
                          <p className="text-xs text-slate-500">
                            {turnstileReady
                              ? '请完成验证后再提交。'
                              : '正在加载验证组件，请稍候...'}
                          </p>
                        </div>
                      ) : null}

                      {/* anti-bot honeypot */}
                      <input
                        value={form.website}
                        onChange={(event) => handleInputChange('website', event.target.value)}
                        tabIndex={-1}
                        autoComplete="off"
                        aria-hidden="true"
                        className="hidden"
                      />

                      <div className="flex flex-wrap items-center justify-end gap-3 pt-1">
                        <button
                          type="button"
                          onClick={resetForm}
                          disabled={submitting}
                          className="rounded-full border border-slate-600 bg-slate-900/60 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800 cursor-pointer disabled:cursor-not-allowed disabled:opacity-55"
                        >
                          清空
                        </button>
                        <button
                          type="submit"
                          disabled={submitting}
                          className="rounded-full border border-cyan-400/70 bg-gradient-to-r from-cyan-600/90 to-blue-600/90 px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-92 cursor-pointer disabled:cursor-not-allowed disabled:opacity-55"
                        >
                          {submitting ? '提交中...' : '提交 Issue'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            ) : null,
            document.body
          )
        : null}
    </>
  );
}
