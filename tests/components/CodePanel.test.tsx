import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CodePanel } from '@/components/shared/CodePanel';
import { FloatingCodeBarContext } from '@/components/shared/FloatingCodeBar';

vi.mock('@/lib/syntax-highlighter', () => ({
  normalizeLanguage: (language?: string) => language ?? 'text',
  ensureLanguageRegistered: async (language?: string) => language ?? 'text',
  SyntaxHighlighter: (props: {
    children: React.ReactNode;
    language: string;
    customStyle?: { fontSize?: string };
    lineProps?: (lineNumber: number) => { style?: { backgroundColor?: string } };
  }) => {
    const lineTwoStyle = props.lineProps?.(2)?.style ?? {};
    return React.createElement(
      'pre',
      {
        'data-testid': 'code-panel-highlighter',
        'data-language': props.language,
        'data-font-size': props.customStyle?.fontSize ?? '',
        'data-line2-bg': lineTwoStyle.backgroundColor ?? '',
      },
      props.children
    );
  },
}));

vi.mock('react-syntax-highlighter/dist/esm/styles/prism/one-dark', () => ({
  default: {},
}));

describe('CodePanel', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('initializes from localStorage and persists font-size changes', async () => {
    window.localStorage.setItem('algo-viz-code-font-size', '20');

    render(
      <CodePanel
        codeLines={['const target = 9;', 'const nums = [2, 7, 11, 15];']}
        highlightLine={1}
        language="typescript"
      />
    );

    const highlighter = await screen.findByTestId('code-panel-highlighter');
    expect(screen.getByText('20')).toBeInTheDocument();
    expect(highlighter).toHaveAttribute('data-language', 'typescript');
    expect(highlighter).toHaveAttribute('data-line2-bg', 'rgba(234, 179, 8, 0.2)');

    const buttons = screen.getAllByRole('button');
    await userEvent.click(buttons[1]);

    await waitFor(() => {
      expect(screen.getByText('22')).toBeInTheDocument();
      expect(highlighter).toHaveAttribute('data-font-size', '22px');
    });
    expect(window.localStorage.getItem('algo-viz-code-font-size')).toBe('22');
  });

  it('shows floating-bar line info and triggers close callback', async () => {
    const onClose = vi.fn();

    render(
      <FloatingCodeBarContext.Provider value={{ highlightLine: 4, onClose }}>
        <CodePanel codeLines="line 1\nline 2" label="Code" />
      </FloatingCodeBarContext.Provider>
    );

    await screen.findByTestId('code-panel-highlighter');
    expect(screen.getByText(/Line 5/)).toBeInTheDocument();

    const buttons = screen.getAllByRole('button');
    await userEvent.click(buttons[2]);

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
