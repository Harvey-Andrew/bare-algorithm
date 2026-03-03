import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';

type LanguageModule = Parameters<typeof SyntaxHighlighter.registerLanguage>[1];
type LanguageLoader = () => Promise<{ default: LanguageModule }>;

const languageMap: Record<string, string> = {
  c: 'c',
  cpp: 'cpp',
  cs: 'c',
  cxx: 'cpp',
  go: 'go',
  java: 'java',
  js: 'javascript',
  json: 'json',
  jsx: 'jsx',
  py: 'python',
  python: 'python',
  rs: 'rust',
  sh: 'bash',
  shell: 'bash',
  sql: 'sql',
  ts: 'typescript',
  tsx: 'tsx',
  txt: 'text',
  typescript: 'typescript',
  javascript: 'javascript',
  zsh: 'bash',
};

const languageLoaders: Record<string, LanguageLoader> = {
  bash: () => import('react-syntax-highlighter/dist/esm/languages/prism/bash'),
  c: () => import('react-syntax-highlighter/dist/esm/languages/prism/c'),
  cpp: () => import('react-syntax-highlighter/dist/esm/languages/prism/cpp'),
  go: () => import('react-syntax-highlighter/dist/esm/languages/prism/go'),
  java: () => import('react-syntax-highlighter/dist/esm/languages/prism/java'),
  javascript: () => import('react-syntax-highlighter/dist/esm/languages/prism/javascript'),
  json: () => import('react-syntax-highlighter/dist/esm/languages/prism/json'),
  jsx: () => import('react-syntax-highlighter/dist/esm/languages/prism/jsx'),
  python: () => import('react-syntax-highlighter/dist/esm/languages/prism/python'),
  rust: () => import('react-syntax-highlighter/dist/esm/languages/prism/rust'),
  sql: () => import('react-syntax-highlighter/dist/esm/languages/prism/sql'),
  tsx: () => import('react-syntax-highlighter/dist/esm/languages/prism/tsx'),
  typescript: () => import('react-syntax-highlighter/dist/esm/languages/prism/typescript'),
};

const loadedLanguages = new Set<string>();

async function registerLanguageIfNeeded(name: string): Promise<void> {
  if (loadedLanguages.has(name)) return;
  const loader = languageLoaders[name];
  if (!loader) return;

  const language = await loader();
  SyntaxHighlighter.registerLanguage(name, language.default);
  loadedLanguages.add(name);
}

export function normalizeLanguage(language: string | undefined): string {
  if (!language) return 'text';
  return languageMap[language.toLowerCase()] || language.toLowerCase();
}

export async function ensureLanguageRegistered(language: string | undefined): Promise<string> {
  const normalized = normalizeLanguage(language);
  if (normalized in languageLoaders) {
    await registerLanguageIfNeeded(normalized);
    return normalized;
  }
  return 'text';
}

export { SyntaxHighlighter };
