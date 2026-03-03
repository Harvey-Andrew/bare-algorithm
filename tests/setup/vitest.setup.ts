import { cleanup } from '@testing-library/react';

import '@testing-library/jest-dom/vitest';

import React from 'react';
import { afterEach, vi } from 'vitest';

afterEach(() => {
  cleanup();
});

if (!window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }),
  });
}

class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin = '0px';
  readonly thresholds = [0];

  disconnect() {
    return undefined;
  }
  observe() {
    return undefined;
  }
  takeRecords() {
    return [];
  }
  unobserve() {
    return undefined;
  }
}

class MockResizeObserver implements ResizeObserver {
  disconnect() {
    return undefined;
  }
  observe() {
    return undefined;
  }
  unobserve() {
    return undefined;
  }
}

Object.defineProperty(globalThis, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});

Object.defineProperty(globalThis, 'ResizeObserver', {
  writable: true,
  configurable: true,
  value: MockResizeObserver,
});

vi.mock('next/link', () => {
  type LinkProps = React.PropsWithChildren<{
    href: string | { pathname: string };
    prefetch?: boolean;
  }> &
    Record<string, unknown>;

  const MockLink = ({ href, prefetch: _prefetch, children, ...rest }: LinkProps) =>
    React.createElement(
      'a',
      { href: typeof href === 'string' ? href : href.pathname, ...rest },
      children
    );

  return { default: MockLink };
});

vi.mock('next/navigation', () => ({
  usePathname: () => '/problems',
}));
