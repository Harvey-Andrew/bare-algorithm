import Link from 'next/link';
import { BookOpen, Terminal } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

import 'katex/dist/katex.min.css';

import { BackButton } from '@/components/shared/BackButton';
import { CodeBlock } from '@/components/shared/CodeBlock';
import { ExternalProblemLink } from '@/components/shared/ExternalProblemLink';

interface SolutionContentProps {
  solutionMarkdown: string | null;
  backHref: string;
  title: string;
  externalLinks: string;
}

function containsMathSyntax(markdown: string): boolean {
  return (
    /(^|[^\\])\$\$?[\s\S]+?\$\$?/.test(markdown) ||
    /\\\(|\\\)|\\\[|\\\]|\\begin\{[^}]+\}/.test(markdown)
  );
}

export function SolutionContent({
  solutionMarkdown,
  backHref,
  title,
  externalLinks,
}: SolutionContentProps) {
  const hasMathSyntax = solutionMarkdown ? containsMathSyntax(solutionMarkdown) : false;
  const remarkPlugins = hasMathSyntax ? [remarkGfm, remarkMath] : [remarkGfm];
  const rehypePlugins = hasMathSyntax ? [rehypeKatex] : [];

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="sticky top-[42px] sm:top-12 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-3 sm:px-6 py-2 sm:py-4 z-10">
        <div className="container mx-auto max-w-4xl flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <div className="sm:hidden shrink-0">
              <BackButton fallbackHref={backHref} />
            </div>
            <BookOpen className="w-6 h-6 text-purple-400 hidden sm:block shrink-0" />

            <h1 className="text-sm sm:text-xl font-bold text-white flex items-center gap-1.5 sm:gap-3 min-w-0 truncate">
              <ExternalProblemLink href={externalLinks} title={title} />
            </h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-3 py-4 sm:px-6 sm:py-8">
        {solutionMarkdown ? (
          <article
            className="prose prose-sm sm:prose-base prose-invert prose-slate max-w-none
              prose-headings:text-slate-200 prose-headings:font-bold
              prose-headings:text-base prose-headings:sm:text-xl prose-headings:lg:text-2xl
              prose-h1:text-lg prose-h1:sm:text-2xl prose-h1:lg:text-3xl
              prose-p:text-slate-100 prose-p:leading-relaxed prose-p:text-sm prose-p:sm:text-base
              prose-strong:text-purple-300 prose-strong:font-bold
              prose-code:text-yellow-300 prose-code:bg-slate-800/50 prose-code:px-1 prose-code:sm:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:sm:text-sm prose-code:before:content-none prose-code:after:content-none
              prose-pre:bg-transparent! prose-pre:p-0! prose-pre:m-0! prose-pre:border-0! prose-pre:rounded-none! prose-pre:overflow-x-auto!
              prose-li:text-slate-100 prose-li:text-sm prose-li:sm:text-base
              prose-table:border-collapse prose-th:border prose-th:border-slate-700 prose-th:p-1.5 prose-th:sm:p-2 prose-th:bg-slate-800 prose-th:text-xs prose-th:sm:text-sm prose-td:border prose-td:border-slate-700 prose-td:p-1.5 prose-td:sm:p-2 prose-td:text-xs prose-td:sm:text-sm
              prose-a:text-blue-400 hover:prose-a:text-blue-300
              [&_table]:block [&_table]:overflow-x-auto [&_table]:max-w-full
              [&_pre]:overflow-x-auto
            "
          >
            <ReactMarkdown
              remarkPlugins={remarkPlugins}
              rehypePlugins={rehypePlugins}
              components={{
                code: CodeBlock,
              }}
            >
              {solutionMarkdown}
            </ReactMarkdown>
          </article>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-slate-500">
            <Terminal size={64} className="mb-6 opacity-20" />
            <p className="text-lg">暂无详细题解内容</p>
            <Link
              href={backHref}
              className="mt-6 px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors"
            >
              返回可视化
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
