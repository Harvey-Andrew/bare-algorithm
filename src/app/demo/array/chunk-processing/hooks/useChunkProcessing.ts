'use client';

import { useCallback, useRef, useState } from 'react';

import { CONFIG, generateMockData } from '../constants';
import { processWithRAF } from '../services/chunk.api';
import type { ChunkResult, DataItem, PerformanceMetrics, ProcessingState } from '../types';

export function useChunkProcessing() {
  const [data, setData] = useState<DataItem[]>(() => generateMockData(CONFIG.DEFAULT_DATA_COUNT));
  const [chunkSize, setChunkSize] = useState(CONFIG.DEFAULT_CHUNK_SIZE);
  const [state, setState] = useState<ProcessingState>({
    status: 'idle',
    progress: 0,
    processedCount: 0,
    totalCount: CONFIG.DEFAULT_DATA_COUNT,
    currentChunk: 0,
    totalChunks: Math.ceil(CONFIG.DEFAULT_DATA_COUNT / CONFIG.DEFAULT_CHUNK_SIZE),
  });
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    totalTime: 0,
    avgChunkTime: 0,
    itemsPerSecond: 0,
  });
  const [results, setResults] = useState<ChunkResult[]>([]);

  const continueRef = useRef(true);

  const startProcessing = useCallback(async () => {
    continueRef.current = true;
    const freshData = generateMockData(CONFIG.DEFAULT_DATA_COUNT);
    setData(freshData);
    setResults([]);
    setState((prev) => ({
      ...prev,
      status: 'processing',
      progress: 0,
      processedCount: 0,
      totalChunks: Math.ceil(freshData.length / chunkSize),
    }));

    const { totalTime, results: chunkResults } = await processWithRAF(
      freshData,
      chunkSize,
      (processed, total, result) => {
        setState((prev) => ({
          ...prev,
          progress: processed / total,
          processedCount: processed,
          currentChunk: result.chunkIndex + 1,
        }));
        setResults((prev) => [...prev, result]);
      },
      () => continueRef.current
    );

    const avgTime = chunkResults.reduce((sum, r) => sum + r.processTime, 0) / chunkResults.length;
    setMetrics({
      totalTime,
      avgChunkTime: avgTime,
      itemsPerSecond: (freshData.length / totalTime) * 1000,
    });
    setState((prev) => ({ ...prev, status: continueRef.current ? 'completed' : 'paused' }));
  }, [chunkSize]);

  const pauseProcessing = useCallback(() => {
    continueRef.current = false;
    setState((prev) => ({ ...prev, status: 'paused' }));
  }, []);

  const resetProcessing = useCallback(() => {
    continueRef.current = false;
    setData(generateMockData(CONFIG.DEFAULT_DATA_COUNT));
    setResults([]);
    setState({
      status: 'idle',
      progress: 0,
      processedCount: 0,
      totalCount: CONFIG.DEFAULT_DATA_COUNT,
      currentChunk: 0,
      totalChunks: Math.ceil(CONFIG.DEFAULT_DATA_COUNT / chunkSize),
    });
  }, [chunkSize]);

  return {
    data,
    state,
    metrics,
    results,
    chunkSize,
    setChunkSize,
    startProcessing,
    pauseProcessing,
    resetProcessing,
  };
}
