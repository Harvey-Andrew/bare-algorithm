'use client';

import { useCallback, useState } from 'react';

import { MOCK_RESOURCES } from '../constants';
import { sortByGreedy } from '../services/preload.api';
import type { Resource } from '../types';

export function usePreloadStrategy() {
  const [resources] = useState<Resource[]>(MOCK_RESOURCES);
  const [loadedIds, setLoadedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const sortedResources = sortByGreedy(resources);

  const startLoad = useCallback(async () => {
    setIsLoading(true);
    setLoadedIds(new Set());

    for (const resource of sortedResources) {
      await new Promise((r) => setTimeout(r, 300));
      setLoadedIds((prev) => new Set([...prev, resource.id]));
    }

    setIsLoading(false);
  }, [sortedResources]);

  const reset = useCallback(() => {
    setLoadedIds(new Set());
    setIsLoading(false);
  }, []);

  return { resources, sortedResources, loadedIds, isLoading, startLoad, reset };
}
