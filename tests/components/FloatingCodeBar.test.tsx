import React, { useContext } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { FloatingCodeBar, FloatingCodeBarContext } from '@/components/shared/FloatingCodeBar';

function ContextProbe() {
  const ctx = useContext(FloatingCodeBarContext);

  return (
    <button data-testid="context-close" onClick={() => ctx?.onClose()}>
      {ctx ? `context-line-${ctx.highlightLine}` : 'no-context'}
    </button>
  );
}

describe('FloatingCodeBar', () => {
  it('opens drawer, injects context, and closes through context callback', async () => {
    render(
      <FloatingCodeBar
        highlightLine={2}
        message="Current operation"
        codeContent={<ContextProbe />}
      />
    );

    const trigger = screen.getByRole('button', { name: /Current operation/i });
    expect(trigger).toHaveTextContent('L3');
    expect(screen.queryByTestId('context-close')).not.toBeInTheDocument();

    await userEvent.click(trigger);
    expect(await screen.findByTestId('context-close')).toHaveTextContent('context-line-2');

    await userEvent.click(screen.getByTestId('context-close'));
    expect(screen.queryByTestId('context-close')).not.toBeInTheDocument();
  });

  it('closes drawer when clicking overlay', async () => {
    const { container } = render(
      <FloatingCodeBar highlightLine={0} message="Overlay close" codeContent={<ContextProbe />} />
    );

    await userEvent.click(screen.getByRole('button', { name: /Overlay close/i }));
    expect(await screen.findByTestId('context-close')).toBeInTheDocument();

    const overlay = container.querySelector('div.fixed.inset-0.z-40');
    expect(overlay).not.toBeNull();
    if (overlay) {
      await userEvent.click(overlay);
    }

    expect(screen.queryByTestId('context-close')).not.toBeInTheDocument();
  });
});
