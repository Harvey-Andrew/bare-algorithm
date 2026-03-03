import type { FlatEntity, NestedEntity, NormalizedData } from '../types';

export function flatten(root: NestedEntity): { normalized: NormalizedData; time: number } {
  const start = performance.now();
  const byId: Record<string, FlatEntity> = {};
  const allIds: string[] = [];
  const rootIds: string[] = [root.id];

  function dfs(entity: NestedEntity, depth: number) {
    byId[entity.id] = {
      id: entity.id,
      name: entity.name,
      parentId: entity.parentId || null,
      depth,
    };
    allIds.push(entity.id);

    if (entity.children) {
      for (const child of entity.children) {
        dfs(child, depth + 1);
      }
    }
  }

  dfs(root, 0);

  return {
    normalized: { byId, allIds, rootIds },
    time: performance.now() - start,
  };
}

export function nest(normalized: NormalizedData): { tree: NestedEntity | null; time: number } {
  const start = performance.now();
  const { byId, rootIds } = normalized;

  if (rootIds.length === 0) return { tree: null, time: 0 };

  const childrenMap = new Map<string | null, string[]>();

  for (const id of Object.keys(byId)) {
    const parentId = byId[id].parentId;
    if (!childrenMap.has(parentId)) childrenMap.set(parentId, []);
    childrenMap.get(parentId)!.push(id);
  }

  function build(id: string): NestedEntity {
    const flat = byId[id];
    const children = childrenMap.get(id);

    return {
      id: flat.id,
      name: flat.name,
      parentId: flat.parentId || undefined,
      children: children?.map(build),
    };
  }

  return { tree: build(rootIds[0]), time: performance.now() - start };
}
