export interface SearchSuggestion {
  id: string;
  text: string;
  type: 'path' | 'file' | 'method';
}

export interface TrieNode {
  children: Map<string, TrieNode>;
  isEnd: boolean;
  suggestions: string[];
}
