import type { NestedEntity } from './types';

const NAMES = ['组织', '部门', '团队', '小组', '项目'];

export function generateMockTree(depth: number = 4, branching: number = 3): NestedEntity {
  let counter = 0;

  function build(currentDepth: number, parentId?: string): NestedEntity {
    const id = `entity-${++counter}`;
    const name = `${NAMES[currentDepth % NAMES.length]} ${counter}`;

    const entity: NestedEntity = { id, name, parentId };

    if (currentDepth < depth) {
      entity.children = Array.from({ length: branching }, () => build(currentDepth + 1, id));
    }

    return entity;
  }

  return build(0);
}

export const CONFIG = {
  DEFAULT_DEPTH: 4,
  DEFAULT_BRANCHING: 3,
};
