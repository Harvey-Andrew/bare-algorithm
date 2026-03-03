'use client';

import { useEffect, useState } from 'react';
import { Code2, X } from 'lucide-react';

const STORAGE_KEY = 'algo:typescript-code-hint:seen:v1';
const MAX_SHOW_COUNT = 3;

export function TypeScriptCodeHint() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let showTimer: number | undefined;
    let hideTimer: number | undefined;

    const showTip = () => {
      showTimer = window.setTimeout(() => {
        setVisible(true);
        // 10秒后自动关闭
        hideTimer = window.setTimeout(() => setVisible(false), 10000);
      }, 0);
    };

    try {
      const showCount = Number(window.localStorage.getItem(STORAGE_KEY) || '0');
      if (showCount < MAX_SHOW_COUNT) {
        showTip();
        window.localStorage.setItem(STORAGE_KEY, String(showCount + 1));
      }
    } catch {
      // localStorage unavailable: still show once in current session render.
      showTip();
    }

    return () => {
      if (showTimer !== undefined) window.clearTimeout(showTimer);
      if (hideTimer !== undefined) window.clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-x-2 top-2 z-60 flex justify-center sm:inset-x-4 sm:top-4">
      <div className="pointer-events-auto flex max-w-3xl items-start gap-3 rounded-xl border border-cyan-500/25 bg-slate-900/95 p-3 text-slate-100 shadow-2xl backdrop-blur">
        <div className="mt-0.5 shrink-0 rounded-lg bg-cyan-500/15 p-1.5 text-cyan-300">
          <Code2 className="h-4 w-4" />
        </div>
        <p className="text-xs leading-relaxed sm:text-sm">
          项目目前以 <strong>TypeScript</strong> 为主。若你需要 Python、Java、C++
          等版本，可以直接复制代码，交给你常用的 AI 工具一键转换。
        </p>
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="shrink-0 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-100 cursor-pointer"
          aria-label="关闭提示"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
