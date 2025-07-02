import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import useInterval from '@/hooks/use-interval';
import { renderHook } from '@testing-library/react';

describe('useInterval unit test', () => {
  const mockAlert = vi.fn();

  beforeAll(() => {
    window.alert = mockAlert;
  });

  beforeEach(() => {
    vi.useFakeTimers();
    mockAlert.mockClear();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('act callback function eact delay time', () => {
    renderHook(() =>
      useInterval(() => {
        window.alert('called');
      }, 500)
    );

    vi.advanceTimersByTime(200);
    expect(mockAlert).not.toBeCalled();

    vi.advanceTimersByTime(300);
    expect(mockAlert).toBeCalledWith('called');

    vi.advanceTimersByTime(1000);
    expect(mockAlert).toHaveBeenCalledTimes(3);
  });

  it('if the delay changes, change the repetition cycle', () => {
    let delay = 500;

    const { rerender } = renderHook(() =>
      useInterval(() => {
        window.alert('called');
      }, delay)
    );

    vi.advanceTimersByTime(1000);
    expect(mockAlert).toHaveBeenCalledTimes(2);

    delay = 200;
    rerender();

    vi.advanceTimersByTime(1000);
    expect(mockAlert).toHaveBeenCalledTimes(7);
  });

  it('always calls the latest callback (no stale closure)', () => {
    let count = 0;
    const callback = vi.fn(() => {
      window.alert(`called-${count}`);
    });

    const { rerender } = renderHook(() => useInterval(callback, 500));

    count = 1;
    rerender();

    vi.advanceTimersByTime(500);
    expect(mockAlert).toHaveBeenCalledWith('called-1');
  });
});
