import { bench, describe } from 'vitest';
import useStatefulQuery from '@react-query-toolkits/hooks/use-stateful-query';
import { createWrapper, fetchMock } from '@react-query-toolkits/utils';
import { useQuery } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';

describe('[Benchmark] useStatefulQuery vs useQuery', () => {
  bench('useStatefulQuery', async () => {
    let deps = 'initial';

    const { rerender, unmount } = renderHook(
      () =>
        useStatefulQuery({
          queryKey: ['test'],
          queryFn: () => fetchMock(1, 10),
          stateValues: [deps],
          hideRefetch: true,
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
