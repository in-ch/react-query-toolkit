import { use } from 'react';

/**
 * A hook that fetches data from an API endpoint and integrates with React Suspense.
 *
 * @template T
 * @param {string} url  The API endpoint to fetch data
 * @param {(input: RequestInfo, init?: RequestInit) => Promise<T>} [fetcher] Optional custom fetcher function.
 * @returns {{ data: T }} fetched data.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { data } = useFetch<{ id: number; name: string }>('https://api.example.com');
 *   return <div>{data.name}</div>;
 * }
 * ```
 */
export function useFetch<T>(
  url: string,
  fetcher?: (input: RequestInfo, init?: RequestInit) => Promise<T>
): { data: T } {
  const defaultFetcher = async (input: RequestInfo) => {
    const res = await fetch(input);
    if (!res.ok) {
      throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
    }
    return res.json();
  };
  const fetchData = () => (fetcher ?? defaultFetcher)(url);

  const data = use(fetchData());
  return { data };
}
