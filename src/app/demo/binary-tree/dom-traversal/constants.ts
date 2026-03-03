import type { TreeNode } from './types';

export const SAMPLE_DOM: TreeNode = {
  id: 'root',
  tag: 'html',
  children: [
    {
      id: 'head',
      tag: 'head',
      children: [
        { id: 'title', tag: 'title', children: [] },
        { id: 'meta', tag: 'meta', children: [] },
      ],
    },
    {
      id: 'body',
      tag: 'body',
      children: [
        { id: 'header', tag: 'header', children: [{ id: 'nav', tag: 'nav', children: [] }] },
        {
          id: 'main',
          tag: 'main',
          children: [
            { id: 'article', tag: 'article', children: [] },
            { id: 'aside', tag: 'aside', children: [] },
          ],
        },
        { id: 'footer', tag: 'footer', children: [] },
      ],
    },
  ],
};
