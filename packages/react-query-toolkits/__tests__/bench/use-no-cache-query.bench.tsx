import { bench, describe } from 'vitest';
import useNoCacheQuery from '@/hooks/use-no-cache-query';
import { createWrapper, fetchMock } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';

describe('[Benchmark] useNoCacheQuery vs useQuery', () => {
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

  bench('useNoCacheQuery', async () => {
    const page = 1;
    const limit = 10;

    const { result, unmount } = renderHook(
      () =>
        useNoCacheQuery({
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
