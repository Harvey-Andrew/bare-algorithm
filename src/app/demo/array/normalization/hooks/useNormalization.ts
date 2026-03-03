'use client';

import { useMemo, useState } from 'react';

import { CONFIG, generateMockTree } from '../constants';
import { flatten, nest } from '../services/normalize.api';
import type { NestedEntity, PerformanceMetrics } from '../types';

export function useNormalization() {
  const [tree] = useState<NestedEntity>(() =>
    generateMockTree(CONFIG.DEFAULT_DEPTH, CONFIG.DEFAULT_BRANCHING)
  );

  const { normalized, flattenTime } = useMemo(() => {
    const { normalized, time } = flatten(tree);
    return { normalized, flattenTime: time };
  }, [tree]);

  const { reconstructed, nestTime } = useMemo(() => {
    const { tree: reconstructed, time } = nest(normalized);
    return { reconstructed, nestTime: time };
  }, [normalized]);

  const metrics: PerformanceMetrics = useMemo(
    () => ({
      flattenTime,
      nestTime,
      entityCount: normalized.allIds.length,
    }),
    [flattenTime, nestTime, normalized.allIds.length]
  );

  return { tree, normalized, reconstructed, metrics };
}
