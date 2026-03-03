export interface Resource {
  id: string;
  name: string;
  priority: number;
  size: number;
  inViewport: boolean;
}

export interface LoadResult {
  loaded: Resource[];
  pending: Resource[];
  totalTime: number;
}
