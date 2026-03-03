export interface DataItem {
  id: number;
  name: string;
  value: number;
}

export interface SearchResult {
  index: number;
  item: DataItem | null;
  comparisons: number;
}
