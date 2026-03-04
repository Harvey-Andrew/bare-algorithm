import { describe, expect, it } from 'vitest';

import { getProblemCommentTerm } from '@/lib/comments/problem-comment-thread';

describe('problem-comment-thread', () => {
  it('builds a stable thread key from category and problem slug', () => {
    expect(getProblemCommentTerm('array', 'two-sum')).toBe('problem:array/two-sum');
  });

  it('preserves nested category and problem values without rewriting them', () => {
    expect(getProblemCommentTerm('dynamic-programming', 'word-break')).toBe(
      'problem:dynamic-programming/word-break'
    );
  });
});
