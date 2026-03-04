import { act, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { GiscusComments } from '@/components/comments/GiscusComments';

const originalEnv = {
  repo: process.env.NEXT_PUBLIC_GISCUS_REPO,
  repoId: process.env.NEXT_PUBLIC_GISCUS_REPO_ID,
  category: process.env.NEXT_PUBLIC_GISCUS_CATEGORY,
  categoryId: process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID,
  lang: process.env.NEXT_PUBLIC_GISCUS_LANG,
};

describe('GiscusComments', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_GISCUS_REPO = 'owner/repo';
    process.env.NEXT_PUBLIC_GISCUS_REPO_ID = 'R_test';
    process.env.NEXT_PUBLIC_GISCUS_CATEGORY = 'Problem Comments';
    process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID = 'DIC_test';
    process.env.NEXT_PUBLIC_GISCUS_LANG = 'zh-CN';
    window.localStorage.clear();
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_GISCUS_REPO = originalEnv.repo;
    process.env.NEXT_PUBLIC_GISCUS_REPO_ID = originalEnv.repoId;
    process.env.NEXT_PUBLIC_GISCUS_CATEGORY = originalEnv.category;
    process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID = originalEnv.categoryId;
    process.env.NEXT_PUBLIC_GISCUS_LANG = originalEnv.lang;
    window.localStorage.clear();
  });

  it('removes a malformed cached giscus session before loading the script', async () => {
    window.localStorage.setItem('giscus-session', '');

    const { container } = render(<GiscusComments category="array" problem="two-sum" />);

    await waitFor(() => {
      expect(window.localStorage.getItem('giscus-session')).toBeNull();
    });

    const script = container.querySelector('script[src="https://giscus.app/client.js"]');
    expect(script).not.toBeNull();
  });

  it('loads giscus in compact discussion mode for the popup', async () => {
    const { container } = render(<GiscusComments category="array" problem="two-sum" />);

    const script = await waitFor(() => {
      const element = container.querySelector('script[src="https://giscus.app/client.js"]');
      expect(element).not.toBeNull();
      return element as HTMLScriptElement;
    });

    expect(script.getAttribute('data-reactions-enabled')).toBe('0');
    expect(script.getAttribute('data-input-position')).toBe('top');
    expect(script.getAttribute('data-term')).toBe('problem:array/two-sum');
  });

  it('treats metadata with a null discussion as a valid empty thread', async () => {
    const onMetadataChange = vi.fn();
    const { container } = render(
      <GiscusComments category="array" problem="new-problem" onMetadataChange={onMetadataChange} />
    );

    await act(async () => {
      window.dispatchEvent(
        new MessageEvent('message', {
          origin: 'https://giscus.app',
          data: {
            giscus: {
              discussion: null,
              viewer: null,
            },
          },
        })
      );
    });

    await waitFor(() => {
      expect(onMetadataChange).toHaveBeenCalledWith({
        totalCommentCount: 0,
        totalReplyCount: 0,
        reactionCount: 0,
        viewer: null,
      });
    });

    expect(container.querySelector('[data-testid="giscus-comments-container"]')).toHaveClass(
      'opacity-100'
    );
  });

  it('keeps custom loading overlay visible before metadata arrives', async () => {
    const { container } = render(<GiscusComments category="array" problem="no-metadata-case" />);

    const host = container.querySelector('[data-testid="giscus-comments-container"]');
    expect(host).not.toBeNull();
    expect(host).toHaveClass('opacity-0');

    await act(async () => {
      window.dispatchEvent(
        new MessageEvent('message', {
          origin: 'https://giscus.app',
          data: { giscus: { discussion: null, viewer: null } },
        })
      );
    });

    await waitFor(() => {
      expect(host).toHaveClass('opacity-100');
    });
  });

  it('uses generic giscus payload as a fallback ready signal', async () => {
    const { container } = render(<GiscusComments category="array" problem="fallback-ready" />);
    const host = container.querySelector('[data-testid="giscus-comments-container"]');
    expect(host).not.toBeNull();

    await act(async () => {
      window.dispatchEvent(
        new MessageEvent('message', {
          origin: 'https://giscus.app',
          data: {
            giscus: {
              viewer: null,
            },
          },
        })
      );
    });

    await waitFor(() => {
      expect(host).toHaveClass('opacity-100');
    });
  });
});
