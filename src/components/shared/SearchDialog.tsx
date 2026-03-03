'use client';

import React, {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowDown, ArrowRight, ArrowUp, CornerDownLeft, Search, X } from 'lucide-react';
import { createPortal } from 'react-dom';

interface SearchItem {
  id: string;
  title: string;
  category: string;
  categoryTitle: string;
  path: string;
  idLower: string;
  titleLower: string;
  categoryTitleLower: string;
}

interface CategoryItem {
  id: string;
  title: string;
}

interface SearchDataItem {
  id: string;
  title: string;
  category: string;
}

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const INITIAL_RESULTS = 10;
const MAX_RESULTS = 20;

let searchDataCache: SearchItem[] | null = null;
let searchDataPromise: Promise<SearchItem[]> | null = null;

function buildSearchData(categories: CategoryItem[], searchData: SearchDataItem[]): SearchItem[] {
  const categoryMap = new Map(categories.map((cat) => [cat.id, cat.title]));

  return searchData.map((item) => {
    const categoryTitle = categoryMap.get(item.category) || item.category;
    return {
      id: item.id,
      title: item.title,
      category: item.category,
      categoryTitle,
      path: `/problems/${item.category}/${item.id}`,
      idLower: item.id.toLowerCase(),
      titleLower: item.title.toLowerCase(),
      categoryTitleLower: categoryTitle.toLowerCase(),
    };
  });
}

async function loadSearchData(): Promise<SearchItem[]> {
  if (searchDataCache) return searchDataCache;
  if (searchDataPromise) return searchDataPromise;

  searchDataPromise = Promise.all([
    import('@/lib/problems/categories.json'),
    import('@/lib/problems/search-data.json'),
  ]).then(([categoriesModule, searchDataModule]) => {
    const categories = categoriesModule.default as CategoryItem[];
    const searchData = searchDataModule.default as SearchDataItem[];

    searchDataCache = buildSearchData(categories, searchData);
    return searchDataCache;
  });

  return searchDataPromise;
}

function fuzzySearch(items: SearchItem[], query: string): SearchItem[] {
  if (!query.trim()) return items.slice(0, INITIAL_RESULTS);

  const lowerQuery = query.toLowerCase();
  const results = items.filter(
    (item) =>
      item.titleLower.includes(lowerQuery) ||
      item.idLower.includes(lowerQuery) ||
      item.categoryTitleLower.includes(lowerQuery)
  );

  return results.slice(0, MAX_RESULTS);
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchData, setSearchData] = useState<SearchItem[]>(() => searchDataCache ?? []);
  const [loadError, setLoadError] = useState(false);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const deferredQuery = useDeferredValue(query);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const prevPathnameRef = useRef(pathname);

  useEffect(() => {
    if (!open || searchData.length > 0 || loadError) return undefined;

    let cancelled = false;

    loadSearchData()
      .then((data) => {
        if (cancelled) return;
        setSearchData(data);
      })
      .catch(() => {
        if (cancelled) return;
        setLoadError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [open, searchData.length, loadError]);

  const results = useMemo(
    () => fuzzySearch(searchData, deferredQuery),
    [searchData, deferredQuery]
  );

  const handleQueryChange = useCallback((newQuery: string) => {
    setQuery(newQuery);
    setSelectedIndex(0);
  }, []);

  useEffect(() => {
    if (!open) return;
    requestAnimationFrame(() => {
      setQuery('');
      setSelectedIndex(0);
      inputRef.current?.focus();
    });
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
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
  }, [open]);

  useEffect(() => {
    if (!listRef.current || results.length === 0) return;
    const selectedElement = listRef.current.children[selectedIndex] as HTMLElement;
    selectedElement?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex, results.length]);

  useEffect(() => {
    if (pathname !== prevPathnameRef.current && open) {
      onOpenChange(false);
    }
    prevPathnameRef.current = pathname;
  }, [pathname, open, onOpenChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % Math.max(results.length, 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + results.length) % Math.max(results.length, 1));
          break;
        case 'Enter':
          e.preventDefault();
          if (results[selectedIndex]) {
            onOpenChange(false);
            router.push(results[selectedIndex].path);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onOpenChange(false);
          break;
      }
    },
    [results, selectedIndex, router, onOpenChange]
  );

  const handleItemClick = useCallback(
    (item: SearchItem) => {
      onOpenChange(false);
      router.push(item.path);
    },
    [router, onOpenChange]
  );

  useEffect(() => {
    if (!open) return undefined;

    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onOpenChange(false);
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [open, onOpenChange]);

  const handleBackdropClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget) {
        onOpenChange(false);
      }
    },
    [onOpenChange]
  );

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-[rgba(101,108,133,0.8)] backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div
        className="fixed left-1/2 top-[5%] sm:top-[15%] z-[10000] w-full max-w-2xl -translate-x-1/2 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="mx-4 overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-900/95 shadow-2xl shadow-black/50 ring-1 ring-white/10">
          <div className="flex items-center gap-3 border-b border-slate-700/50 px-4 py-4">
            <Search className="h-5 w-5 text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="搜索算法题目..."
              className="flex-1 bg-transparent text-base text-slate-100 placeholder:text-slate-500 outline-none"
            />
            <button
              onClick={() => onOpenChange(false)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
            >
              <X className="h-4 w-4 cursor-pointer" />
            </button>
          </div>

          <div
            ref={listRef}
            className="max-h-[70vh] sm:max-h-[60vh] overflow-y-auto overscroll-contain p-2"
          >
            {searchData.length === 0 && !loadError ? (
              <div className="py-12 text-center text-slate-500">搜索索引加载中...</div>
            ) : loadError ? (
              <div className="py-12 text-center text-slate-500">加载失败，请重试</div>
            ) : results.length === 0 ? (
              <div className="py-12 text-center text-slate-500">没有找到匹配的算法题目</div>
            ) : (
              results.map((item, index) => (
                <button
                  key={`${item.category}-${item.id}`}
                  onClick={() => handleItemClick(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left cursor-pointer transition-all duration-150 ${
                    index === selectedIndex
                      ? 'bg-[var(--algo-primary)]/20 text-white'
                      : 'text-slate-300 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{item.title}</div>
                    <div className="text-sm text-slate-500 truncate">
                      {item.categoryTitle} · {item.id}
                    </div>
                  </div>
                  {index === selectedIndex ? (
                    <ArrowRight className="h-4 w-4 shrink-0 text-[var(--algo-primary)]" />
                  ) : null}
                </button>
              ))
            )}
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-slate-700/50 bg-slate-900/50 px-4 py-2.5 text-xs text-slate-500">
            <div className="hidden sm:flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <kbd className="inline-flex items-center gap-0.5 rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 font-mono text-[10px]">
                  <ArrowUp className="h-2.5 w-2.5" />
                </kbd>
                <kbd className="inline-flex items-center gap-0.5 rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 font-mono text-[10px]">
                  <ArrowDown className="h-2.5 w-2.5" />
                </kbd>
                <span className="ml-1">导航</span>
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="inline-flex items-center gap-0.5 rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 font-mono text-[10px]">
                  <CornerDownLeft className="h-2.5 w-2.5" />
                </kbd>
                <span className="ml-1">选择</span>
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 font-mono text-[10px]">
                  Esc
                </kbd>
                <span className="ml-1">关闭</span>
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span>共 {searchData.length} 道题目</span>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
