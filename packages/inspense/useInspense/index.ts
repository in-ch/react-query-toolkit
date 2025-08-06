import { useMemo } from 'react';
import { fetcherWrapper } from '@inspense/fetcherWrapper';

/**
 * A hook that wraps a fetch call and returns a Suspense-compatible reader.
 *
 * @template T
 * @param {string} url - API endpoint to fetch.
 * @param {(input: RequestInfo, init?: RequestInit) => Promise<T>} [fetcher] - Optional custom fetcher function.
 * @returns {{ fetch: () => T }} - A reader object with a `fetch()` method that throws while loading.
 *
 * @example
 * const { fetch } = useInspense('/api/user');
 * const user = fetch(); // throws if loading, returns data if loaded
 */
export function useInspense<T>(
  url: string,
  fetcher: (input: RequestInfo, init?: RequestInit) => Promise<T> = url => fetch(url).then(res => res.json())
): { fetch: () => T } {
  const resource = useMemo(() => {
    let promise: Promise<T> | null = null;
    return fetcherWrapper(() => {
      if (!promise) {
        promise = fetcher(url);
      }
      return promise;
    });
  }, [url]);

  return {
    fetch: resource.fetch,
  };
}
