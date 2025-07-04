import { bench, describe } from 'vitest';
import useParallelQuery from '@react-query-toolkits/hooks/use-parallel-query';
import { createWrapper, fetchMock } from '@react-query-toolkits/utils';
import { useQueries } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';

describe('[Benchmark] useParallelQuery vs useQueries', () => {
  bench('useParallelQuery', async () => {
    const { result, unmount } = renderHook(
      () =>
        useParallelQuery([
          { queryKey: ['q1'], queryFn: () => fetchMock(1, 10) },
          { queryKey: ['q2'], queryFn: () => fetchMock(1, 10) },
          { queryKey: ['q3'], queryFn: () => fetchMock(1, 10) },
        ]),
      {
        wrapper: createWrapper(),
      }
    );

    await act(async () => {
      await result.current.refetchAll();
    });

    unmount();
  });

  bench('useQueries', async () => {
    const { result, unmount } = renderHook(
      () =>
        useQueries({
          queries: [
            { queryKey: ['q1'], queryFn: () => fetchMock(1, 10) },
            { queryKey: ['q2'], queryFn: () => fetchMock(1, 10) },
            { queryKey: ['q3'], queryFn: () => fetchMock(1, 10) },
          ],
        }),
      {
        wrapper: createWrapper(),
      }
    );

    await act(async () => {
      await Promise.all(result.current.map(r => r.refetch()));
    });

    unmount();
  });
});
