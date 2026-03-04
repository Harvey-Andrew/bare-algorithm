import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ProblemCommentsButton } from '@/components/comments/ProblemCommentsSection';

vi.mock('@/components/comments/GiscusComments', () => ({
  GiscusComments: ({
    onMetadataChange,
  }: {
    onMetadataChange?: (metadata: {
      totalCommentCount: number;
      totalReplyCount: number;
      reactionCount: number;
      viewer: { login: string; avatarUrl: string; url: string } | null;
    }) => void;
  }) => {
    React.useEffect(() => {
      onMetadataChange?.({
        totalCommentCount: 2,
        totalReplyCount: 1,
        reactionCount: 0,
        viewer: {
          login: 'octocat',
          avatarUrl: 'https://avatars.githubusercontent.com/u/1',
          url: 'https://github.com/octocat',
        },
      });
    }, [onMetadataChange]);

    return <div data-testid="mock-giscus-comments">comments</div>;
  },
}));

describe('ProblemCommentsButton', () => {
  it('renders the trigger button and exposes the thread key', () => {
    render(<ProblemCommentsButton category="array" problem="two-sum" />);

    expect(screen.getByTestId('problem-comments-button')).toHaveTextContent('讨论');
    expect(screen.getByTestId('problem-comments-term')).toHaveTextContent('problem:array/two-sum');
  });

  it('shows the total message count only when it is greater than one', async () => {
    render(<ProblemCommentsButton category="array" problem="two-sum" />);

    fireEvent.pointerEnter(screen.getByTestId('problem-comments-button'));

    expect(await screen.findByTestId('problem-comments-count')).toHaveTextContent('3');
  });

  it('opens the modal and renders a visible giscus instance', async () => {
    render(<ProblemCommentsButton category="array" problem="two-sum" />);

    fireEvent.click(screen.getByTestId('problem-comments-button'));

    const dialog = await screen.findByRole('dialog', { name: '讨论弹窗' });
    expect(dialog).toBeInTheDocument();
    expect(await screen.findByTestId('mock-giscus-comments')).toBeInTheDocument();
    expect(screen.getAllByTestId('mock-giscus-comments')).toHaveLength(1);
  });

  it('updates the trigger title once viewer metadata is available', async () => {
    render(<ProblemCommentsButton category="array" problem="two-sum" />);

    fireEvent.click(screen.getByTestId('problem-comments-button'));

    expect(await screen.findByTestId('mock-giscus-comments')).toBeInTheDocument();
    expect(screen.getByTestId('problem-comments-button')).toHaveAttribute(
      'title',
      '已登录 GitHub：octocat'
    );
  });
});
