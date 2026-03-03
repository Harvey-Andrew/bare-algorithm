import type { DiffResult, Item } from '../types';

export function computeDiff(
  oldList: Item[],
  newList: Item[]
): { result: DiffResult; time: number } {
  const start = performance.now();

  const oldIds = new Set(oldList.map((i) => i.id));
  const newIds = new Set(newList.map((i) => i.id));
  const _newMap = new Map(newList.map((i) => [i.id, i]));
  const _oldMap = new Map(oldList.map((i) => [i.id, i]));

  const added: Item[] = [];
  const removed: Item[] = [];
  const unchanged: Item[] = [];

  for (const item of newList) {
    if (!oldIds.has(item.id)) {
      added.push(item);
    } else {
      unchanged.push(item);
    }
  }

  for (const item of oldList) {
    if (!newIds.has(item.id)) {
      removed.push(item);
    }
  }

  return { result: { added, removed, unchanged }, time: performance.now() - start };
}
