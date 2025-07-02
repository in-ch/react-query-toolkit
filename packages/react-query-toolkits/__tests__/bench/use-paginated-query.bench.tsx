import { bench, describe } from 'vitest';
import usePaginatedQuery from '@/hooks/use-paginated-query';
import { createWrapper, fetchMock } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';

describe('[Benchmark] usePaginatedQuery vs useQuery', () => {
  bench('usePaginatedQuery', async () => {
    const { result, unmount } = renderHook(
      () =>
        usePaginatedQuery({
          queryKey: ['test'],
          queryFn: fetchMock,
          initialPage: 1,
          initialLimit: 10,
        }),
      {
        wrapper: createWrapper(),
      }
    );
    await result.current.refetch();
    unmount();
  });

  bench('useQuery', async () => {
    const page = 1;
    const limit = 10;

    const { result, unmount } = renderHook(
      () =>
        useQuery({
          queryKey: ['test', page, limit],
          queryFn: () => fetchMock(page, limit),
        }),
      {
        wrapper: createWrapper(),
      }
    );

    await result.current.refetch();
    unmount();
  });
});
