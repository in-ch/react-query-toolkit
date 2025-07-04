import { bench, describe } from 'vitest';
import useSchedule from '@react-query-toolkits/hooks/use-schedule';
import { createWrapper, fetchMock } from '@react-query-toolkits/utils';
import { useQuery } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';

describe('[Benchmark] useSchedule vs useQuery', () => {
  bench('useSchedule', async () => {
    const { result, unmount } = renderHook(
      () =>
        useSchedule({
          queryKey: ['test'],
          queryFn: () => fetchMock(1, 10),
          delay: 50,
          interval: 0,
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
          refetchOnWindowFocus: false,
          refetchOnMount: false,
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
