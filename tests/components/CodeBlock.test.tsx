import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { CodeBlock } from '@/components/shared/CodeBlock';

vi.mock('@/lib/syntax-highlighter', () => ({
  normalizeLanguage: (language?: string) => language ?? 'text',
  SyntaxHighlighter: ({ children }: { children: React.ReactNode }) =>
    React.createElement('pre', { 'data-testid': 'syntax-highlighter' }, children),
}));

vi.mock('react-syntax-highlighter/dist/esm/styles/prism/one-dark', () => ({
  default: {},
}));

describe('CodeBlock', () => {
  it('renders highlighted block and copies text', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    render(
      <CodeBlock className="language-ts">{`const target = 7;
const nums = [2, 7, 11, 15];`}</CodeBlock>
    );

    expect(await screen.findByTestId('syntax-highlighter')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /copy/i }));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith('const target = 7;\nconst nums = [2, 7, 11, 15];');
    });
    expect(screen.getByText(/copied/i)).toBeInTheDocument();
  });
});
