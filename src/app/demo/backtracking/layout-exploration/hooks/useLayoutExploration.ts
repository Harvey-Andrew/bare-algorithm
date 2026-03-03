'use client';

import { useCallback, useState } from 'react';

import { DEFAULT_WIDGETS, GRID_SIZE } from '../constants';
import type { LayoutSolution, LayoutWidget, PlacedWidget } from '../types';

function canPlace(grid: boolean[][], widget: LayoutWidget, x: number, y: number): boolean {
  if (x + widget.width > GRID_SIZE || y + widget.height > GRID_SIZE) return false;
  for (let dy = 0; dy < widget.height; dy++) {
    for (let dx = 0; dx < widget.width; dx++) {
      if (grid[y + dy][x + dx]) return false;
    }
  }
  return true;
}

function placeWidget(
  grid: boolean[][],
  widget: LayoutWidget,
  x: number,
  y: number,
  place: boolean
) {
  for (let dy = 0; dy < widget.height; dy++) {
    for (let dx = 0; dx < widget.width; dx++) {
      grid[y + dy][x + dx] = place;
    }
  }
}

function findLayouts(widgets: LayoutWidget[]): LayoutSolution[] {
  const solutions: LayoutSolution[] = [];
  const grid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(false));

  function backtrack(idx: number, current: PlacedWidget[]) {
    if (idx === widgets.length) {
      solutions.push({ id: `layout-${solutions.length}`, placements: [...current] });
      return;
    }
    if (solutions.length >= 20) return; // 限制解决方案数量

    const widget = widgets[idx];
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        if (canPlace(grid, widget, x, y)) {
          placeWidget(grid, widget, x, y, true);
          current.push({ ...widget, x, y });
          backtrack(idx + 1, current);
          current.pop();
          placeWidget(grid, widget, x, y, false);
        }
      }
    }
  }

  backtrack(0, []);
  return solutions;
}

export function useLayoutExploration() {
  const [widgets] = useState<LayoutWidget[]>(DEFAULT_WIDGETS);
  const [solutions, setSolutions] = useState<LayoutSolution[]>([]);
  const [selectedSolution, setSelectedSolution] = useState<LayoutSolution | null>(null);

  const explore = useCallback(() => {
    const result = findLayouts(widgets);
    setSolutions(result);
    setSelectedSolution(result[0] || null);
  }, [widgets]);

  return {
    widgets,
    solutions,
    selectedSolution,
    setSelectedSolution,
    explore,
    gridSize: GRID_SIZE,
  };
}
