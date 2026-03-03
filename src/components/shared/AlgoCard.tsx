import type { ReactNode } from 'react';
import Link from 'next/link';

import { DifficultyBadge } from '@/components/shared/DifficultyBadge';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Difficulty } from '@/types/problem';

export interface AlgoCardProps {
  id: string;
  title: string;
  description?: string;
  tags?: string[];
  href: string;
  difficulty?: Difficulty;
  leadingIcon?: ReactNode;
  reserveTagRows?: number;
}

export function AlgoCard({
  title,
  description,
  tags = [],
  href,
  difficulty,
  leadingIcon,
  reserveTagRows = 0,
}: AlgoCardProps) {
  const normalizedDescription = description?.trim();
  const isCompact = !normalizedDescription;
  const shouldAlignIconWithTitle = Boolean(leadingIcon) && !difficulty;
  const shouldReserveTagArea = reserveTagRows > 0;
  const tagAreaClass =
    reserveTagRows >= 2 ? 'min-h-[3rem] sm:min-h-[3.25rem]' : 'min-h-[1.75rem] sm:min-h-[2rem]';

  return (
    <Card
      className={cn(
        'group relative flex overflow-hidden rounded-2xl border border-white/8 bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-slate-950/95 shadow-[0_10px_32px_-22px_rgba(2,6,23,0.9)] transition-all duration-200 hover:-translate-y-0.5 hover:border-(--algo-primary)/50 hover:shadow-[0_16px_40px_-20px_var(--algo-primary-glow)] !gap-0 !py-0',
        isCompact ? 'h-auto self-start' : 'h-full'
      )}
    >
      <Link href={href} aria-label={title} className="absolute inset-0 z-10 rounded-2xl" />

      <div
        className={cn(
          'relative z-0 flex h-full w-full flex-col px-4 sm:px-5',
          isCompact ? 'py-3 sm:py-4' : 'py-3 sm:py-4.5'
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div
            className={cn(
              'flex min-w-0 gap-3',
              shouldAlignIconWithTitle ? 'items-center' : 'items-start'
            )}
          >
            {leadingIcon && (
              <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-(--algo-primary)/10 text-(--algo-primary) sm:size-12">
                {leadingIcon}
              </div>
            )}
            <h3
              className={cn(
                'min-w-0 text-base font-semibold leading-snug tracking-tight text-slate-100 sm:text-lg',
                isCompact && 'line-clamp-2 min-h-[2.75rem] sm:min-h-[3.5rem]'
              )}
            >
              {title}
            </h3>
          </div>
          {difficulty ? <DifficultyBadge difficulty={difficulty} className="shrink-0" /> : null}
        </div>

        {!isCompact && (
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground sm:mt-2 sm:text-[15px]">
            {normalizedDescription}
          </p>
        )}

        {(tags.length > 0 || shouldReserveTagArea) && (
          <div
            className={cn('mt-2.5 flex items-end sm:mt-3', shouldReserveTagArea && tagAreaClass)}
          >
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <Badge key={tag} variant="flat" shape="square" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
