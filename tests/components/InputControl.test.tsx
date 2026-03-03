import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { InputControl } from '@/components/shared/VisualizerHeader';

describe('InputControl dialog interactions', () => {
  it('keeps the dialog open when text selection ends outside the modal', async () => {
    render(<InputControl value="nums=[2,7,11,15], target=9" onChange={vi.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: '输入' }));

    const textarea = screen.getByRole('textbox');
    const backdropArea = screen.getByRole('dialog').parentElement;
    expect(backdropArea).not.toBeNull();

    fireEvent.pointerDown(textarea);
    fireEvent.pointerUp(backdropArea!);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('still closes when clicking the backdrop', async () => {
    render(<InputControl value="nums=[2,7,11,15], target=9" onChange={vi.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: '输入' }));

    const backdropArea = screen.getByRole('dialog').parentElement;
    expect(backdropArea).not.toBeNull();

    fireEvent.pointerDown(backdropArea!);
    fireEvent.pointerUp(backdropArea!);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
