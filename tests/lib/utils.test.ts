import { describe, expect, it } from 'vitest';

import { cn, matchMode } from '@/lib/utils';

describe('utils', () => {
  it('cn merges tailwind class conflicts', () => {
    const result = cn('px-2 text-sm', null, undefined, 'px-4');

    expect(result).toContain('px-4');
    expect(result).toContain('text-sm');
    expect(result).not.toContain('px-2');
  });

  it('matchMode returns mapped value for known mode', () => {
    const value = matchMode('HASH_MAP', {
      BRUTE_FORCE: 'brute',
      HASH_MAP: 'hash',
      TWO_POINTER: 'two-pointer',
    });

    expect(value).toBe('hash');
  });

  it('matchMode falls back to first value for unknown mode', () => {
    const value = matchMode('UNKNOWN', {
      BRUTE_FORCE: 'brute',
      HASH_MAP: 'hash',
    });

    expect(value).toBe('brute');
  });

  it('matchMode throws if map is empty', () => {
    expect(() => matchMode('UNKNOWN', {})).toThrow('Invalid mode');
  });
});
