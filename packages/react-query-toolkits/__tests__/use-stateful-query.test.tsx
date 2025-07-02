import { beforeEach, describe, expect, it, vi } from 'vitest';
import React, { useState } from 'react';
import useStatefulQuery, { hasRefetch } from '@/hooks/use-stateful-query';
import { QueryCache } from '@tanstack/react-query';
import { waitFor } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import { createQueryClient, queryKey, renderWithClient, sleep } from '../utils';

const mockConsoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});

describe('useStatefulQuery', () => {
  const queryCache = new QueryCache();
  const queryClient = createQueryClient({
    queryCache,
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  beforeEach(() => {
    queryCache.clear();
    mockConsoleWarn.mockClear();
  });

  it('should allow to set default data value', async () => {
    const key = queryKey();
    function Page() {
      const { data = 'default' } = useStatefulQuery({
        queryKey: key,
        queryFn: async () => {
          await sleep(10);
          return 'test';
        },
      });
      return <div>{data}</div>;
    }
    const rendered = renderWithClient(queryClient, <Page />);
    rendered.getByText('default');
    await waitFor(() => rendered.getByText('test'));
  });

  it('should refetch when state changes', async () => {
    const key = queryKey();
    let queryCallCount = 0;

    function Page() {
      const [count, setCount] = useState(0);
      const { data } = useStatefulQuery({
        queryKey: [...key, count],
        queryFn: async () => {
          queryCallCount++;
          await sleep(10);
          return `data-${count}`;
        },
        stateValues: [count],
      });

      return (
        <div>
          <div data-testid="data">{data || 'loading'}</div>
          <button data-testid="increment" onClick={() => setCount(c => c + 1)}>
            Increment
          </button>
        </div>
      );
    }

    const rendered = renderWithClient(queryClient, <Page />);
    await waitFor(() => rendered.getByText('data-0'));
    expect(queryCallCount).toBe(1);
    fireEvent.click(rendered.getByTestId('increment'));
    await waitFor(() => rendered.getByText('data-1'));
    expect(queryCallCount).toBe(2);
  });

  it('should hide refetch when state values are present', async () => {
    const key = queryKey();

    function Page() {
      const [searchTerm] = useState('initial');
      const result = useStatefulQuery({
        queryKey: [...key, searchTerm],
        queryFn: async () => {
          return `result-${searchTerm}`;
        },
        stateValues: [searchTerm],
        hideRefetch: true,
      });

      return (
        <div>
          <div data-testid="data">{result.data || 'loading'}</div>
          <div data-testid="has-refetch">{hasRefetch(result) ? 'has-refetch' : 'no-refetch'}</div>
        </div>
      );
    }

    const rendered = renderWithClient(queryClient, <Page />);

    await waitFor(() => rendered.getByText('result-initial'));
    expect(rendered.getByTestId('has-refetch').textContent).toBe('no-refetch');
  });

  it('should show warning when refetch is called with hideRefetch=false', async () => {
    const key = queryKey();

    function Page() {
      const [searchTerm] = useState('test');
      const result = useStatefulQuery({
        queryKey: [...key, searchTerm],
        queryFn: async () => {
          return `result-${searchTerm}`;
        },
        stateValues: [searchTerm],
        hideRefetch: false,
      });

      return (
        <div>
          <div data-testid="data">{result.data || 'loading'}</div>
          {hasRefetch(result) && (
            <button data-testid="refetch" onClick={() => result.refetch()}>
              Refetch
            </button>
          )}
        </div>
      );
    }

    const rendered = renderWithClient(queryClient, <Page />);
    await waitFor(() => rendered.getByText('result-test'));
    fireEvent.click(rendered.getByTestId('refetch'));

    expect(mockConsoleWarn).toHaveBeenCalledWith(
      'Manual refetch is disabled for state-dependent queries. State changes will automatically trigger refetches.'
    );
  });

  it('should allow normal refetch when no state values are provided', async () => {
    const key = queryKey();
    let queryCallCount = 0;

    function Page() {
      const result = useStatefulQuery({
        queryKey: key,
        queryFn: async () => {
          queryCallCount++;
          return `static-data-${queryCallCount}`;
        },
        stateValues: [],
      });

      return (
        <div>
          <div data-testid="data">{result.data || 'loading'}</div>
          <div data-testid="has-refetch">{hasRefetch(result) ? 'has-refetch' : 'no-refetch'}</div>
          {hasRefetch(result) && (
            <button data-testid="refetch" onClick={() => result.refetch()}>
              Refetch
            </button>
          )}
        </div>
      );
    }

    const rendered = renderWithClient(queryClient, <Page />);
    await waitFor(() => rendered.getByText('static-data-1'));
    expect(rendered.getByTestId('has-refetch').textContent).toBe('has-refetch');
    expect(queryCallCount).toBe(1);
    fireEvent.click(rendered.getByTestId('refetch'));
    await waitFor(() => rendered.getByText('static-data-2'));
    expect(queryCallCount).toBe(2);
  });
});
