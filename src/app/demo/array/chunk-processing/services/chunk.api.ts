import type { ChunkResult, DataItem } from '../types';

export function* chunkGenerator<T>(array: T[], chunkSize: number): Generator<T[]> {
  for (let i = 0; i < array.length; i += chunkSize) {
    yield array.slice(i, i + chunkSize);
  }
}

export function processChunk(items: DataItem[], chunkIndex: number): ChunkResult {
  const start = performance.now();

  // 模拟处理
  for (const item of items) {
    item.processed = true;
    item.value = Math.sqrt(item.value) * 2;
  }

  return {
    chunkIndex,
    itemCount: items.length,
    processTime: performance.now() - start,
    success: true,
  };
}

export async function processWithRAF(
  items: DataItem[],
  chunkSize: number,
  onProgress: (processed: number, total: number, chunkResult: ChunkResult) => void,
  shouldContinue: () => boolean
): Promise<{ totalTime: number; results: ChunkResult[] }> {
  const start = performance.now();
  const results: ChunkResult[] = [];
  const chunks = [...chunkGenerator(items, chunkSize)];
  let processed = 0;

  for (let i = 0; i < chunks.length; i++) {
    if (!shouldContinue()) break;

    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        const result = processChunk(chunks[i], i);
        results.push(result);
        processed += chunks[i].length;
        onProgress(processed, items.length, result);
        resolve();
      });
    });
  }

  return { totalTime: performance.now() - start, results };
}
