import { vi } from 'vitest';
import useParallelQuery from '@/hooks/use-parallel-query';
import { createQueryClient, queryKey, renderWithClient } from '@/utils';
import { QueryCache } from '@tanstack/react-query';
import { waitFor } from '@testing-library/react';

describe('useParallelQuery', () => {
  const queryCache = new QueryCache();
  const queryClient = createQueryClient({
    queryCache,
  });

  it('should handle multiple successful queries', async () => {
    const key = queryKey();
    const mockQueryFn = vi.fn(async () => {
      return ['data1', 'data2'];
    });
    const mockQueries = [
      {
        queryKey: [key],
        queryFn: mockQueryFn,
      },
      {
        queryKey: [key],
        queryFn: mockQueryFn,
      },
    ];
    function Page() {
      const { results } = useParallelQuery(mockQueries);
      return (
        <div>
          <div data-testid="status">{results.length}</div>
        </div>
      );
    }

    const rendered = renderWithClient(queryClient, <Page />);
    expect(rendered.getByTestId('status').textContent).toBe('2');
  });

  it('should handle loading state correctly', async () => {
    const key = queryKey();
    const mockQueryFn = vi.fn(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
      return 'data';
    });

    const mockQueries = [
      {
        queryKey: [key],
        queryFn: mockQueryFn,
      },
    ];

    function Page() {
      const { isLoading } = useParallelQuery(mockQueries);
      return (
        <div>
          <div data-testid="loading">{isLoading ? 'loading' : 'loaded'}</div>
        </div>
      );
    }

    const rendered = renderWithClient(queryClient, <Page />);
    expect(rendered.getByTestId('loading').textContent).toBe('loading');

    await waitFor(() => {
      expect(rendered.getByTestId('loading').textContent).toBe('loaded');
    });
  });

  it('should handle refetchAll correctly', async () => {
    const key = queryKey();
    let count = 0;
    const mockQueryFn = vi.fn(async () => {
      count++;
      return `data${count}`;
    });

    const mockQueries = [
      {
        queryKey: [key],
        queryFn: mockQueryFn,
      },
    ];

    function Page() {
      const { data, refetchAll } = useParallelQuery(mockQueries);
      return (
        <div>
          <div data-testid="data">{data[0]}</div>
          <button onClick={() => refetchAll()} data-testid="refetch">
            Refetch
          </button>
        </div>
      );
    }

    const rendered = renderWithClient(queryClient, <Page />);

    await waitFor(() => {
      expect(rendered.getByTestId('data').textContent).toBe('data1');
    });

    rendered.getByTestId('refetch').click();

    await waitFor(() => {
      expect(rendered.getByTestId('data').textContent).toBe('data2');
    });
  });

  it('should handle success state correctly', async () => {
    const key = queryKey();
    const mockQueryFn = vi.fn(async () => 'success');

    const mockQueries = [
      {
        queryKey: [key],
        queryFn: mockQueryFn,
      },
    ];

    function Page() {
      const { isSuccess, data } = useParallelQuery(mockQueries);
      return (
        <div>
          <div data-testid="success">{isSuccess ? 'success' : 'not-success'}</div>
          <div data-testid="data">{data[0]}</div>
        </div>
      );
    }

    const rendered = renderWithClient(queryClient, <Page />);

    await waitFor(() => {
      expect(rendered.getByTestId('success').textContent).toBe('success');
      expect(rendered.getByTestId('data').textContent).toBe('success');
    });
  });
});
