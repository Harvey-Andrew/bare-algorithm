export interface LayoutWidget {
  id: string;
  name: string;
  width: number;
  height: number;
}

export interface PlacedWidget extends LayoutWidget {
  x: number;
  y: number;
}

export interface LayoutSolution {
  id: string;
  placements: PlacedWidget[];
}
