import { useEffect, useRef } from 'react';

export default function useInterval(callback: () => void, delay: number) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };
  const startInterval = (nextDelay: number) => {
    stopInterval();
    intervalRef.current = setInterval(() => {
      callback();
    }, nextDelay);
  };
  useEffect(() => {
    startInterval(delay);
  }, [delay]);
  useEffect(() => {
    return () => {
      stopInterval();
    };
  }, []);
}
