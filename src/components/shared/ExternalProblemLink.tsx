'use client';

import { ExternalLink } from 'lucide-react';

import { useIsDesktop } from '@/hooks/useIsDesktop';

interface ExternalProblemLinkProps {
  href: string;
  title: string;
}

export function ExternalProblemLink({ href, title }: ExternalProblemLinkProps) {
  const isDesktop = useIsDesktop();

  return (
    <a
      href={href}
      target={isDesktop ? '_blank' : undefined}
      rel="noopener noreferrer"
      className="hover:opacity-80 transition-opacity flex items-center gap-1 truncate bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-emerald-400 to-emerald-500"
    >
      <span className="truncate">{title}</span>
      <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 text-slate-500 shrink-0" />
    </a>
  );
}
