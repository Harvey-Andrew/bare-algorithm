import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { SearchTrigger } from '@/components/shared/SearchTrigger';

vi.mock('@/components/shared/SearchDialog', () => ({
  SearchDialog: ({ open }: { open: boolean }) =>
    open ? React.createElement('div', { 'data-testid': 'search-dialog' }, 'Search dialog') : null,
}));

describe('SearchTrigger', () => {
  it('opens dialog by keyboard shortcut', async () => {
    render(<SearchTrigger />);

    fireEvent.keyDown(document, { key: 'k', ctrlKey: true });

    expect(await screen.findByTestId('search-dialog')).toBeInTheDocument();
  });

  it('opens dialog by trigger click', async () => {
    render(<SearchTrigger compact />);

    fireEvent.click(screen.getByRole('button'));

    expect(await screen.findByTestId('search-dialog')).toBeInTheDocument();
  });
});
