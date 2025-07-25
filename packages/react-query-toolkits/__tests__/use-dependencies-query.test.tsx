import { describe, expect, it, vi } from 'vitest';
import useDependenciesQuery from '@react-query-toolkits/hooks/use-dependencies-query';
import { createQueryClient, queryKey } from '@react-query-toolkits/utils';
import { QueryCache, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';

describe('useDependenciesQuery', () => {
  const queryCache = new QueryCache();
  const queryClient = createQueryClient({
    queryCache,
  });

  it('should allow to set default data value', async () => {
    const key = queryKey();
    const mockFn = vi.fn().mockResolvedValue('hello');
    function Page() {
      const { status, isLoading } = useDependenciesQuery({
        queryKey: key,
        dependencies: [],
        queryFn: mockFn,
      });
      return (
        <div>
          <div data-testid="status">{status}</div>
          <div data-testid="isLoading">{isLoading}</div>
        </div>
      );
    }
    const client = createQueryClient();
    render(
      <QueryClientProvider client={client}>
        <Page />
      </QueryClientProvider>
    );

    expect(screen.getByTestId('status').textContent).toBe('pending');
    expect(mockFn).not.toHaveBeenCalled();
  });

  it('should refetch when dependencies change', async () => {
    const key = queryKey();
    const mockFn = vi.fn().mockResolvedValue('value');
    let dep = 'one';

    function Page({ depValue }: { depValue: string }) {
      const { data } = useDependenciesQuery({
        queryKey: [key, depValue],
        dependencies: [depValue],
        queryFn: mockFn,
      });
      return <div data-testid="data">{data}</div>;
    }

    const { rerender } = render(
      <QueryClientProvider client={queryClient}>
        <Page depValue={dep} />
      </QueryClientProvider>
    );

    await screen.findByTestId('data');
    expect(mockFn).toHaveBeenCalledTimes(1);
    console.log({ rerender });
  });
});
