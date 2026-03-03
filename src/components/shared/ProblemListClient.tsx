'use client';

import React, { useEffect, useRef, useState, useTransition } from 'react';
import { usePathname } from 'next/navigation';

import type { ProblemMeta } from '@/types/problem';
import { ProblemCard } from './ProblemCard';

interface ProblemListClientProps {
  problems: ProblemMeta[];
  compactOnMobile?: boolean;
}

const ITEMS_PER_PAGE = 25;

const MemoizedProblemCard = React.memo(ProblemCard);

function getStorageKey(pathname: string) {
  return `problemList_visibleCount_${pathname}`;
}

export function ProblemListClient({ problems, compactOnMobile = false }: ProblemListClientProps) {
  const pathname = usePathname();
  const restoredRef = useRef(false);

  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [, startTransition] = useTransition();
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (restoredRef.current || problems.length <= ITEMS_PER_PAGE) return;

    restoredRef.current = true;

    const timerId = window.setTimeout(() => {
      try {
        const saved = sessionStorage.getItem(getStorageKey(pathname));
        if (!saved) return;

        const count = parseInt(saved, 10);
        if (!Number.isNaN(count) && count > ITEMS_PER_PAGE) {
          setVisibleCount(Math.min(count, problems.length));
        }
      } catch {
        // Ignore sessionStorage access errors.
      }
    }, 0);

    return () => window.clearTimeout(timerId);
  }, [pathname, problems.length]);

  useEffect(() => {
    if (problems.length <= ITEMS_PER_PAGE) return;

    try {
      sessionStorage.setItem(getStorageKey(pathname), String(visibleCount));
    } catch {
      // Ignore sessionStorage access errors.
    }
  }, [visibleCount, pathname, problems.length]);

  useEffect(() => {
    if (problems.length <= ITEMS_PER_PAGE) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (!target?.isIntersecting) return;

        startTransition(() => {
          setVisibleCount((prev) => Math.min(prev + ITEMS_PER_PAGE, problems.length));
        });
      },
      {
        root: null,
        rootMargin: '500px',
        threshold: 0.1,
      }
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
      observer.disconnect();
    };
  }, [problems.length, startTransition]);

  const visibleProblems = problems.slice(0, visibleCount);
  const hasMore = visibleCount < problems.length;

  return (
    <div className={compactOnMobile ? 'space-y-4 sm:space-y-8' : 'space-y-8'}>
      {visibleProblems.length > 0 ? (
        <div
          className={
            compactOnMobile
              ? 'grid gap-3 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
          }
        >
          {visibleProblems.map((problem) => (
            <MemoizedProblemCard key={problem.id} problem={problem} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg bg-muted/30 py-12 text-center text-muted-foreground">
          No problems yet. Stay tuned...
        </div>
      )}

      {hasMore && (
        <div
          ref={loaderRef}
          className={
            compactOnMobile ? 'flex justify-center py-5 sm:py-8' : 'flex justify-center py-8'
          }
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="h-2 w-2 animate-bounce rounded-full bg-blue-500 [animation-delay:-0.3s]" />
            <div className="h-2 w-2 animate-bounce rounded-full bg-blue-500 [animation-delay:-0.15s]" />
            <div className="h-2 w-2 animate-bounce rounded-full bg-blue-500" />
          </div>
        </div>
      )}
    </div>
  );
}
