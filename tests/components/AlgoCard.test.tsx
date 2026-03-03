import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AlgoCard } from '@/components/shared/AlgoCard';

describe('AlgoCard', () => {
  it('renders title, tags, and destination link', () => {
    render(
      <AlgoCard
        id="two-sum"
        title="Two Sum"
        description="Find indices that add up to target"
        tags={['array', 'hash-table']}
        href="/problems/array/two-sum"
        difficulty="easy"
      />
    );

    expect(screen.getByRole('link', { name: /Two Sum/i })).toHaveAttribute(
      'href',
      '/problems/array/two-sum'
    );
    expect(screen.getByText('array')).toBeInTheDocument();
    expect(screen.getByText('hash-table')).toBeInTheDocument();
    expect(screen.getByText('Find indices that add up to target')).toBeInTheDocument();
  });

  it('renders without optional fields', () => {
    render(
      <AlgoCard
        id="reverse-string"
        title="Reverse String"
        tags={['string']}
        href="/problems/string/reverse-string"
      />
    );

    expect(screen.getByRole('link', { name: /Reverse String/i })).toHaveAttribute(
      'href',
      '/problems/string/reverse-string'
    );
    expect(screen.getByText('string')).toBeInTheDocument();
  });
});
