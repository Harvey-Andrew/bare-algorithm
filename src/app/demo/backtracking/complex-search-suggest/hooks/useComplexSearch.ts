'use client';

import { useCallback, useMemo, useState } from 'react';

import { SAMPLE_PATHS } from '../constants';
import type { SearchSuggestion } from '../types';

function searchWithBacktrack(paths: string[], prefix: string): SearchSuggestion[] {
  const results: SearchSuggestion[] = [];
  const lowerPrefix = prefix.toLowerCase();

  paths.forEach((p) => {
    if (p.toLowerCase().includes(lowerPrefix)) {
      results.push({
        id: `sug-${results.length}`,
        text: p,
        type: p.endsWith('.ts') || p.endsWith('.tsx') ? 'file' : 'path',
      });
    }
  });

  return results.slice(0, 10);
}

export function useComplexSearch() {
  const [query, setQuery] = useState('');
  const paths = useMemo(() => SAMPLE_PATHS, []);

  const suggestions = useMemo(() => {
    if (!query.trim()) return [];
    return searchWithBacktrack(paths, query);
  }, [paths, query]);

  const handleSearch = useCallback((q: string) => {
    setQuery(q);
  }, []);

  return { query, suggestions, handleSearch, paths };
}
