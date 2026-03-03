'use client';

import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Code, Minus, Plus, X } from 'lucide-react';

import { FloatingCodeBarContext } from './FloatingCodeBar';

interface CodePanelProps {
  codeLines: string[] | string;
  highlightLine?: number;
  label?: string;
  language?: string;
}

type CodePanelHighlighterBundle = {
  ensureLanguageRegistered: (language: string | undefined) => Promise<string>;
  oneDarkStyle: Record<string, unknown>;
  SyntaxHighlighter: React.ComponentType<Record<string, unknown>>;
};

let codePanelHighlighterPromise: Promise<CodePanelHighlighterBundle> | null = null;

async function loadCodePanelHighlighter(): Promise<CodePanelHighlighterBundle> {
  if (!codePanelHighlighterPromise) {
    codePanelHighlighterPromise = Promise.all([
      import('@/lib/syntax-highlighter'),
      import('react-syntax-highlighter/dist/esm/styles/prism/one-dark'),
    ]).then(([syntaxModule, styleModule]) => ({
      ensureLanguageRegistered: syntaxModule.ensureLanguageRegistered,
      oneDarkStyle: styleModule.default as Record<string, unknown>,
      SyntaxHighlighter: syntaxModule.SyntaxHighlighter as unknown as React.ComponentType<
        Record<string, unknown>
      >,
    }));
  }

  return codePanelHighlighterPromise;
}

const FONT_SIZES = [10, 12, 14, 16, 18, 20, 22, 24];
const STORAGE_KEY = 'algo-viz-code-font-size';
const DEFAULT_MOBILE = 12;
const DEFAULT_DESKTOP = 16;

function CodePanelFallback() {
  return (
    <div className="p-3 space-y-2">
      {Array.from({ length: 12 }, (_, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="w-5 h-3 rounded bg-slate-800 shrink-0" />
          <div
            className="h-3 rounded bg-slate-800 animate-pulse"
            style={{
              width: `${[72, 88, 60, 95, 45, 80, 65, 50, 90, 70, 55, 40][i % 12]}%`,
              animationDelay: `${i * 50}ms`,
            }}
          />
        </div>
      ))}
    </div>
  );
}

export function CodePanel({
  codeLines,
  highlightLine = -1,
  label = 'Code',
  language = 'javascript',
}: CodePanelProps) {
  const floatingBar = useContext(FloatingCodeBarContext);
  const [fontSizePx, setFontSizePx] = useState(() => {
    if (typeof window === 'undefined') {
      return DEFAULT_MOBILE;
    }

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const num = parseInt(saved, 10);
        if (FONT_SIZES.includes(num)) {
          return num;
        }
      }

      return window.matchMedia('(max-width: 640px)').matches ? DEFAULT_MOBILE : DEFAULT_DESKTOP;
    } catch {
      return DEFAULT_MOBILE;
    }
  });
  const [highlighterBundle, setHighlighterBundle] = useState<CodePanelHighlighterBundle | null>(
    null
  );
  const [resolvedLanguage, setResolvedLanguage] = useState('text');

  useEffect(() => {
    let cancelled = false;
    void loadCodePanelHighlighter().then((bundle) => {
      if (!cancelled) {
        setHighlighterBundle(bundle);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!highlighterBundle) return;

    let cancelled = false;
    void highlighterBundle.ensureLanguageRegistered(language).then((nextLanguage) => {
      if (!cancelled) {
        setResolvedLanguage(nextLanguage);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [highlighterBundle, language]);

  const changeFontSize = useCallback((delta: number) => {
    setFontSizePx((prev) => {
      const idx = FONT_SIZES.indexOf(prev);
      const nextIdx = Math.max(0, Math.min(FONT_SIZES.length - 1, idx + delta));
      const next = FONT_SIZES[nextIdx];
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  const codeString = Array.isArray(codeLines) ? codeLines.join('\n') : codeLines;
  const SyntaxHighlighter = highlighterBundle?.SyntaxHighlighter;

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 flex flex-col overflow-hidden h-full">
      <div className="bg-slate-800/30 px-4 py-2 border-b border-slate-800 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
            <Code size={14} className="text-blue-400" />
            {floatingBar ? (
              <span>
                {label}{' '}
                <span className="text-purple-300">Line {floatingBar.highlightLine + 1}</span>
              </span>
            ) : (
              label
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5 bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
              <button
                onClick={() => changeFontSize(-1)}
                disabled={fontSizePx <= FONT_SIZES[0]}
                className="px-1.5 py-1 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Minus size={12} />
              </button>
              <span className="text-[10px] text-slate-300 w-7 text-center tabular-nums select-none">
                {fontSizePx}
              </span>
              <button
                onClick={() => changeFontSize(1)}
                disabled={fontSizePx >= FONT_SIZES[FONT_SIZES.length - 1]}
                className="px-1.5 py-1 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Plus size={12} />
              </button>
            </div>

            {floatingBar && (
              <button
                onClick={floatingBar.onClose}
                className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-auto flex-1 relative w-full">
        {SyntaxHighlighter && highlighterBundle ? (
          <div className="animate-fade-in">
            <SyntaxHighlighter
              language={resolvedLanguage}
              style={highlighterBundle.oneDarkStyle}
              showLineNumbers
              lineNumberStyle={{
                minWidth: '2em',
                paddingRight: '1em',
                color: '#4b5563',
                userSelect: 'none',
              }}
              wrapLines
              lineProps={(lineNumber: number) => ({
                style: {
                  display: 'block',
                  backgroundColor:
                    highlightLine === lineNumber - 1 ? 'rgba(234, 179, 8, 0.2)' : 'transparent',
                  borderLeft:
                    highlightLine === lineNumber - 1
                      ? '2px solid #eab308'
                      : '2px solid transparent',
                  paddingLeft: '0.5rem',
                },
              })}
              customStyle={{
                margin: 0,
                padding: '0.75rem',
                background: 'transparent',
                fontSize: `${fontSizePx}px`,
                minHeight: '100%',
                overflow: 'visible',
                width: 'fit-content',
                minWidth: '100%',
              }}
            >
              {codeString}
            </SyntaxHighlighter>
          </div>
        ) : (
          <CodePanelFallback />
        )}
      </div>
    </div>
  );
}
