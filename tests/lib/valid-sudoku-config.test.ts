import { afterEach, describe, expect, it } from 'vitest';

import { validSudokuConfig } from '@/lib/problems/hash-table/valid-sudoku/index';

declare global {
  var __validSudokuExecuted__: boolean | undefined;
}

describe('validSudokuConfig.parseInput', () => {
  afterEach(() => {
    delete globalThis.__validSudokuExecuted__;
  });

  it('parses a valid JSON board', () => {
    const parsed = validSudokuConfig.parseInput(`board = [
  ["5","3",".",".","7",".",".",".","."],
  ["6",".",".","1","9","5",".",".","."],
  [".","9","8",".",".",".",".","6","."],
  ["8",".",".",".","6",".",".",".","3"],
  ["4",".",".","8",".","3",".",".","1"],
  ["7",".",".",".","2",".",".",".","6"],
  [".","6",".",".",".",".","2","8","."],
  [".",".",".","4","1","9",".",".","5"],
  [".",".",".",".","8",".",".","7","9"]
]`);

    expect(parsed).toEqual({
      board: [
        ['5', '3', '.', '.', '7', '.', '.', '.', '.'],
        ['6', '.', '.', '1', '9', '5', '.', '.', '.'],
        ['.', '9', '8', '.', '.', '.', '.', '6', '.'],
        ['8', '.', '.', '.', '6', '.', '.', '.', '3'],
        ['4', '.', '.', '8', '.', '3', '.', '.', '1'],
        ['7', '.', '.', '.', '2', '.', '.', '.', '6'],
        ['.', '6', '.', '.', '.', '.', '2', '8', '.'],
        ['.', '.', '.', '4', '1', '9', '.', '.', '5'],
        ['.', '.', '.', '.', '8', '.', '.', '7', '9'],
      ],
    });
  });

  it('rejects code-like input without executing it', () => {
    const parsed = validSudokuConfig.parseInput(`board = [
  [(() => { globalThis.__validSudokuExecuted__ = true; return "5"; })(),".",".",".",".",".",".",".","."],
  [".",".",".",".",".",".",".",".","."],
  [".",".",".",".",".",".",".",".","."],
  [".",".",".",".",".",".",".",".","."],
  [".",".",".",".",".",".",".",".","."],
  [".",".",".",".",".",".",".",".","."],
  [".",".",".",".",".",".",".",".","."],
  [".",".",".",".",".",".",".",".","."],
  [".",".",".",".",".",".",".",".","."]
]`);

    expect(parsed).toBeNull();
    expect(globalThis.__validSudokuExecuted__).toBeUndefined();
  });
});
