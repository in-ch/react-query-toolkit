import { useEffect, useRef } from 'react';

/**
 * Custom React hook that runs a callback repeatedly at a specified interval.
 * Automatically restarts the interval when the delay changes,
 * and clears the interval when the component is unmounted.
 *
 * @param callback The function to be executed at each interval.
 * @param delay Interval time in milliseconds.
 * @returns {void}
 * @example
 * ```tsx
 * useInterval(() => {
 *   console.log('Tick');
 * }, 1000);
 * ```
 */
export default function useInterval(callback: () => void, delay: number): void {
  const savedCallback = useRef<() => void>(() => {});
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  useEffect(() => {
    if (delay === null || delay === undefined) return;

    const id = setInterval(() => {
      savedCallback.current();
    }, delay);

    return () => clearInterval(id);
  }, [delay]);
}
