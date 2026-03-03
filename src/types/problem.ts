export type Difficulty = 'easy' | 'medium' | 'hard';

export type AlgorithmCategory =
  | 'array'
  | 'string'
  | 'linked-list'
  | 'tree'
  | 'graph'
  | 'dp'
  | 'stack'
  | 'queue'
  | 'heap'
  | 'hash'
  | 'binary-search'
  | 'sort'
  | 'greedy'
  | 'backtrack'
  | 'math'
  | 'prefix-sum'
  | 'heap-priority-queue';

export interface CategoryMeta {
  id: string;
  title: string;
  description: string;
  icon?: string;
  count?: number;
}

export interface ProblemMeta {
  id: string;
  title: string;
  description?: string;
  difficulty: Difficulty;
  category: AlgorithmCategory;
  stageId?: string;
  tags: string[];
  externalLinks?: string;
}

export interface StudyStageMeta {
  id: string;
  title: string;
  description: string;
}

export interface StudyStageWithProblems extends StudyStageMeta {
  problems: ProblemMeta[];
}

export interface ApplicationMeta {
  id: string;
  title: string;
  description: string;
  tags: string[];
  difficulty: Difficulty;
  link?: string;
}

export interface TheoryMeta {
  id: string;
  title: string;
  description: string;
  tags: string[];
  link?: string;
}

export interface CategoryGuideMeta {
  id: string;
  title: string;
  description: string;
  problems: ProblemMeta[];
}
