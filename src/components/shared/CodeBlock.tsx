'use client';

import React, { useEffect, useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface CodeBlockProps {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

type CodeBlockHighlighterBundle = {
  ensureLanguageRegistered: (language: string | undefined) => Promise<string>;
  oneDarkStyle: Record<string, unknown>;
  SyntaxHighlighter: React.ComponentType<Record<string, unknown>>;
};

let codeBlockHighlighterPromise: Promise<CodeBlockHighlighterBundle> | null = null;

async function loadCodeBlockHighlighter(): Promise<CodeBlockHighlighterBundle> {
  if (!codeBlockHighlighterPromise) {
    codeBlockHighlighterPromise = Promise.all([
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

  return codeBlockHighlighterPromise;
}

export function CodeBlock({ inline, className, children, ...props }: CodeBlockProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [highlighterBundle, setHighlighterBundle] = useState<CodeBlockHighlighterBundle | null>(
    null
  );
  const [resolvedLanguage, setResolvedLanguage] = useState('text');

  const match = /language-([a-zA-Z0-9+#-]+)/.exec(className || '');
  const codeString = String(children).replace(/\n$/, '');

  useEffect(() => {
    if (inline || !match) return;

    let cancelled = false;
    void loadCodeBlockHighlighter().then((bundle) => {
      if (!cancelled) {
        setHighlighterBundle(bundle);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [inline, match]);

  useEffect(() => {
    if (inline || !match || !highlighterBundle) return;

    let cancelled = false;
    void highlighterBundle.ensureLanguageRegistered(match[1]).then((nextLanguage) => {
      if (!cancelled) {
        setResolvedLanguage(nextLanguage);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [inline, match, highlighterBundle]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeString);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  if (!inline && match) {
    const SyntaxHighlighter = highlighterBundle?.SyntaxHighlighter;

    return (
      <div className="relative group rounded-md overflow-hidden my-4 border border-slate-700/50 bg-[#282c34]">
        <div className="flex justify-between items-center px-4 py-2 bg-slate-800/80 border-b border-slate-700/50 backdrop-blur-sm">
          <span className="text-xs font-mono text-slate-400 lowercase">{match[1]}</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors p-1 rounded-md hover:bg-slate-700/50 cursor-pointer"
            title="Copy code"
          >
            {isCopied ? (
              <>
                <Check size={14} className="text-emerald-400" />
                <span className="text-emerald-400 font-bold">Copied</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        <div className="relative">
          {SyntaxHighlighter && highlighterBundle ? (
            <SyntaxHighlighter
              style={highlighterBundle.oneDarkStyle}
              language={resolvedLanguage}
              PreTag="div"
              customStyle={{
                margin: 0,
                borderRadius: 0,
                padding: '1.5rem',
                backgroundColor: 'transparent',
              }}
              {...props}
            >
              {codeString}
            </SyntaxHighlighter>
          ) : (
            <pre className="m-0 overflow-x-auto bg-transparent p-6">
              <code className="text-sm leading-relaxed text-slate-200">{codeString}</code>
            </pre>
          )}
        </div>
      </div>
    );
  }

  return (
    <code className={className} {...props}>
      {children}
    </code>
  );
}
