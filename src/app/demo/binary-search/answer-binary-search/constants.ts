export const MIN_CHUNK_SIZE = 1;
export const MAX_CHUNK_SIZE = 100;
export const TARGET_TIME = 16; // 目标时间 16ms (60fps)

// 模拟处理函数：chunk 越大，单次处理时间越长
export function simulateProcessTime(chunkSize: number): number {
  return chunkSize * 0.2 + Math.random() * 2;
}
