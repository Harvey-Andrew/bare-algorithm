import Image from 'next/image';
import Link from 'next/link';
import { Github, Home } from 'lucide-react';

import { SearchTrigger } from './SearchTrigger';

const iconButtonClass =
  'inline-flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-lg border border-slate-700/60 bg-slate-900/70 text-slate-300 transition-colors hover:border-slate-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-[var(--algo-primary)]/50';

export function ClientNavbar() {
  return (
    <nav className="sticky top-0 z-50 border-b bg-background">
      <div className="container mx-auto flex h-[42px] sm:h-12 items-center justify-between px-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-2.5 sm:gap-4">
          <Link href="/" className="flex min-w-0 items-center gap-2">
            <Image
              src="/barealgo.png"
              alt="朴素算法"
              width={32}
              height={32}
              className="h-7 w-7 shrink-0 rounded-lg sm:h-8 sm:w-8"
            />
            <span className="truncate text-xs font-semibold tracking-tight sm:text-lg">
              Bare Algo
            </span>
          </Link>

          <div className="hidden sm:block">
            <SearchTrigger />
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="sm:hidden">
            <SearchTrigger compact />
          </div>
          <Link href="/" className={iconButtonClass} aria-label="首页">
            <Home className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Link>
          <a
            href="https://github.com/Harvey-Andrew/bare-algorithm"
            target="_blank"
            rel="noopener noreferrer"
            className={iconButtonClass}
            aria-label="GitHub"
          >
            <Github className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </a>
        </div>
      </div>
    </nav>
  );
}
