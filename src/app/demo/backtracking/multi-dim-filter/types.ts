export interface FilterDimension {
  name: string;
  options: string[];
}

export interface SKUCombination {
  id: string;
  values: Record<string, string>;
}

export interface GenerationResult {
  combinations: SKUCombination[];
  totalCount: number;
  generationTime: number;
}
