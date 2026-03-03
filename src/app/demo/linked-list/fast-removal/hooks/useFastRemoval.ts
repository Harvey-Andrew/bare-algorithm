'use client';

import { useCallback, useState } from 'react';

import { DEFAULT_ITEMS } from '../constants';
import type { ListItem } from '../types';

function createLinkedList(names: string[]): { items: Map<string, ListItem>; head: string | null } {
  const items = new Map<string, ListItem>();
  let head: string | null = null;
  let prevId: string | null = null;

  names.forEach((name, idx) => {
    const id = `item-${idx}`;
    const item: ListItem = { id, name, prev: prevId, next: null };
    if (prevId) {
      const prev = items.get(prevId)!;
      prev.next = id;
    }
    items.set(id, item);
    if (idx === 0) head = id;
    prevId = id;
  });

  return { items, head };
}

export function useFastRemoval() {
  const [state, setState] = useState(() => createLinkedList(DEFAULT_ITEMS));
  const [lastOperation, setLastOperation] = useState<{
    type: string;
    name: string;
    time: number;
  } | null>(null);

  const getOrderedItems = useCallback((): ListItem[] => {
    const result: ListItem[] = [];
    let current = state.head;
    while (current) {
      const item = state.items.get(current);
      if (!item) break;
      result.push(item);
      current = item.next;
    }
    return result;
  }, [state]);

  const remove = useCallback((id: string) => {
    const start = performance.now();
    setState((prev) => {
      const item = prev.items.get(id);
      if (!item) return prev;

      const newItems = new Map(prev.items);
      let newHead = prev.head;

      // O(1) 删除：更新前后节点的指针
      if (item.prev) {
        const prevItem = newItems.get(item.prev)!;
        newItems.set(item.prev, { ...prevItem, next: item.next });
      } else {
        newHead = item.next;
      }
      if (item.next) {
        const nextItem = newItems.get(item.next)!;
        newItems.set(item.next, { ...nextItem, prev: item.prev });
      }
      newItems.delete(id);

      setLastOperation({ type: 'remove', name: item.name, time: performance.now() - start });
      return { items: newItems, head: newHead };
    });
  }, []);

  const reset = useCallback(() => {
    setState(createLinkedList(DEFAULT_ITEMS));
    setLastOperation(null);
  }, []);

  return { orderedItems: getOrderedItems(), remove, reset, lastOperation };
}
