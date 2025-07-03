import { vi } from 'vitest';
import usePaginatedQuery from '@react-query-toolkits/hooks/use-paginated-query';
import { createQueryClient, queryKey, renderWithClient } from '@react-query-toolkits/utils';
import { QueryCache } from '@tanstack/react-query';
import { waitFor } from '@testing-library/react';

const mockData = Array.from({ length: 100 }, (_, i) => `Item ${i + 1}`);

describe('useSchedule', () => {
  const queryCache = new QueryCache();
  const queryClient = createQueryClient({
    queryCache,
  });

  it('should fetch initial data correctly', async () => {
    const mockQueryFn = vi.fn(async (page: number, limit: number) => {
      const start = (page - 1) * limit;
      return mockData.slice(start, start + limit);
    });
    const key = queryKey();
    function Page() {
      const { data, status } = usePaginatedQuery({
        queryKey: key,
        queryFn: mockQueryFn,
        initialPage: 1,
        initialLimit: 10,
      });
      return (
        <div>
          <div data-testid="status">{status}</div>
          <div data-testid="data">{data || 'loading'}</div>
        </div>
      );
    }
    const rendered = renderWithClient(queryClient, <Page />);
    expect(rendered.getByTestId('status').textContent).toBe('pending');
    expect(rendered.getByTestId('data').textContent).toBe('loading');
    await waitFor(() => expect(mockQueryFn).toHaveBeenCalledTimes(1));
    expect(rendered.getByTestId('status').textContent).toBe('success');
    expect(rendered.getByTestId('data').textContent).toBe(
      'Item 1Item 2Item 3Item 4Item 5Item 6Item 7Item 8Item 9Item 10'
    );
  });

  it('should fetch initial data correctly (2)', async () => {
    const mockQueryFn = vi.fn(async (page: number, limit: number) => {
      const start = (page - 1) * limit;
      return mockData.slice(start, start + limit);
    });
    const key = queryKey();
    function Page() {
      const { data, status } = usePaginatedQuery({
        queryKey: key,
        queryFn: mockQueryFn,
        initialPage: 2,
        initialLimit: 20,
      });
      return (
        <div>
          <div data-testid="status">{status}</div>
          <div data-testid="data">{data || 'loading'}</div>
        </div>
      );
    }
    const rendered = renderWithClient(queryClient, <Page />);
    expect(rendered.getByTestId('status').textContent).toBe('pending');
    expect(rendered.getByTestId('data').textContent).toBe('loading');
    await waitFor(() => expect(mockQueryFn).toHaveBeenCalledTimes(1));
    expect(rendered.getByTestId('status').textContent).toBe('success');
    expect(rendered.getByTestId('data').textContent).toBe(
      'Item 21Item 22Item 23Item 24Item 25Item 26Item 27Item 28Item 29Item 30Item 31Item 32Item 33Item 34Item 35Item 36Item 37Item 38Item 39Item 40'
    );
  });
});
