import { bench, describe, vi } from 'vitest';
import useInterval from '@react-query-toolkits/hooks/use-interval';
import { act, renderHook } from '@testing-library/react';

describe('[Benchmark] useInterval', () => {
  bench('useInterval (1000ms delay)', () => {
    const callback = () => {};

    const { unmount } = renderHook(() => useInterval(callback, 1000));

    unmount();
  });

  bench('useInterval (null delay)', () => {
    const callback = () => {};

    const { unmount } = renderHook(() => useInterval(callback, null as any));

    unmount();
  });
});
