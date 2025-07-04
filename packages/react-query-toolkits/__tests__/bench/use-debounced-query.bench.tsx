import { bench, describe } from 'vitest';
import useDebouncedQuery from '@react-query-toolkits/hooks/use-debounced-query';
import { createWrapper, fetchMock } from '@react-query-toolkits/utils';
import { useQuery } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';

describe('[Benchmark] useDebouncedQuery vs useQuery', () => {
  bench('useDebouncedQuery', async () => {
    let deps = 'initial';

    const { result, rerender, unmount } = renderHook(
      () =>
        useDebouncedQuery({
          queryKey: ['test', deps],
          queryFn: () => fetchMock(1, 10),
          deps: [deps],
          delay: 0,
        }),
      {
        wrapper: createWrapper(),
      }
    );

    deps = 'changed';
    rerender();

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    unmount();
  });

  bench('useQuery', async () => {
    let deps = 'initial';

    const { result, rerender, unmount } = renderHook(
      () =>
        useQuery({
          queryKey: ['test', deps],
          queryFn: () => fetchMock(1, 10),
        }),
      {
        wrapper: createWrapper(),
      }
    );

    deps = 'changed';
    rerender();

    await act(async () => {
      await result.current.refetch();
    });

    unmount();
  });
});
