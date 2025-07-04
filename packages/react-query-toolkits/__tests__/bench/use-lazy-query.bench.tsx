import { bench, describe } from 'vitest';
import useLazyQuery from '@react-query-toolkits/hooks/use-lazy-query';
import { createWrapper, fetchMock } from '@react-query-toolkits/utils';
import { useQuery } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';

describe('[Benchmark] useLazyQuery vs useQuery', () => {
  bench('useLazyQuery', async () => {
    const { result, unmount } = renderHook(
      () =>
        useLazyQuery({
          queryKey: ['test'],
          queryFn: () => fetchMock(1, 10),
        }),
      {
        wrapper: createWrapper(),
      }
    );

    await act(async () => {
      await result.current.refetch();
    });

    unmount();
  });

  bench('useQuery', async () => {
    const { result, unmount } = renderHook(
      () =>
        useQuery({
          queryKey: ['test'],
          queryFn: () => fetchMock(1, 10),
        }),
      {
        wrapper: createWrapper(),
      }
    );

    await act(async () => {
      await result.current.refetch();
    });

    unmount();
  });
});
