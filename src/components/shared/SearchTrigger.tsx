'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';

type SearchDialogComponent = React.ComponentType<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
}>;

let searchDialogPromise: Promise<SearchDialogComponent> | null = null;
let activeShortcutHandler: (() => void) | null = null;

function loadSearchDialog() {
  if (!searchDialogPromise) {
    searchDialogPromise = import('./SearchDialog').then((mod) => mod.SearchDialog);
  }
  return searchDialogPromise;
}

interface SearchTriggerProps {
  compact?: boolean;
}

export function SearchTrigger({ compact = false }: SearchTriggerProps) {
  const [open, setOpen] = useState(false);
  const [SearchDialogComponent, setSearchDialogComponent] = useState<SearchDialogComponent | null>(
    null
  );

  const preloadDialog = useCallback(() => {
    void loadSearchDialog();
  }, []);

  const openDialog = useCallback(async () => {
    if (!SearchDialogComponent) {
      const LoadedSearchDialog = await loadSearchDialog();
      setSearchDialogComponent(() => LoadedSearchDialog);
    }
    setOpen(true);
  }, [SearchDialogComponent]);

  const isMac = useMemo(() => {
    if (typeof navigator !== 'undefined') {
      return navigator.platform.toLowerCase().includes('mac');
    }
    return false;
  }, []);

  useEffect(() => {
    if (activeShortcutHandler) return undefined;

    activeShortcutHandler = () => {
      void openDialog();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        activeShortcutHandler?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (activeShortcutHandler) {
        activeShortcutHandler = null;
      }
    };
  }, [openDialog]);

  const buttonClass = compact
    ? 'cursor-pointer inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-700/60 bg-slate-900/70 text-slate-300 transition-all hover:border-slate-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-[var(--algo-primary)]/50'
    : 'cursor-pointer flex items-center gap-2 rounded-xl border border-slate-700/50 bg-slate-800/50 px-3 py-2 text-sm text-slate-400 transition-all hover:border-slate-600 hover:bg-slate-800 hover:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[var(--algo-primary)]/50';

  return (
    <>
      <button
        onClick={() => void openDialog()}
        onPointerEnter={preloadDialog}
        onFocus={preloadDialog}
        className={buttonClass}
        aria-label={compact ? '搜索算法' : undefined}
      >
        <Search className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
        {!compact && (
          <>
            <span className="hidden sm:inline">搜索算法...</span>
            <kbd className="ml-1 hidden sm:inline-flex items-center gap-0.5 rounded border border-slate-600 bg-slate-700/50 px-1.5 py-0.5 font-mono text-[10px] text-slate-400">
              {isMac ? 'Cmd' : 'Ctrl'}+K
            </kbd>
          </>
        )}
      </button>

      {open && SearchDialogComponent ? (
        <SearchDialogComponent open={open} onOpenChange={setOpen} />
      ) : null}
    </>
  );
}
