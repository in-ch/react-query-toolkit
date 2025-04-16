import { useEffect, useState } from 'react';
import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';

type UseDebouncedQueryParams<TQueryFnData, TError, TData> = {
  queryKey: any[];
  queryFn: (...args) => Promise<TQueryFnData>;
  delay?: number;
  deps?: unknown[];
} & Omit<UseQueryOptions<TQueryFnData, TError, TData>, 'queryKey' | 'queryFn'>;

/**
 * A custom hook that simplifies debounced data fetching using React Query.
 *
 * @template TQueryFnData - The raw data type returned by the query function.
 * @template TError - The error type that may be thrown by the query function.
 * @template TData - The transformed data type returned by the query result (defaults to `TQueryFnData`).
 *
 * @param {Object} params - The parameters to configure the hook.
 * @param {QueryKey} params.queryKey - The base query key for identifying the query in the cache.
 * @param {(...args) => Promise<TQueryFnData>} params.queryFn - The function that fetches the data.
 * @param {number} [params.delay=300] - The initial delay time.
 * @param {string[]} [params.deps=[]] - The depsendencies for the delay.
 * @param {Omit<UseQueryOptions<TQueryFnData, TError, TData>, 'queryKey' | 'queryFn'>} [params.queryOptions] - Additional React Query options.
 *
 * @returns {UseQueryResult<TData, TError>} The query result
 * @example
 * ```tsx
 * const {
 *   data,
 *   isLoading,
 *   page,
 *   setPage,
 *   limit,
 *   setLimit,
 * } = useDebouncedQuery({
 *   queryKey: ['users'],
 *   queryFn: (page, limit) => fetchUsers(page, limit),
 *   delay: 1000,
 * });
 * ```
 */
export default function useDebouncedQuery<TQueryFnData = unknown, TError = unknown, TData = TQueryFnData>({
  queryKey,
  queryFn,
  delay = 300,
  deps = [],
  ...queryOptions
}: UseDebouncedQueryParams<TQueryFnData, TError, TData>): UseQueryResult<TData, TError> {
  const [debounced, setDebounced] = useState(false);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(true), delay);
    return () => {
      clearTimeout(handler);
      setDebounced(false);
    };
  }, deps);

  return useQuery({
    ...queryOptions,
    queryKey: [...queryKey],
    queryFn,
    enabled: debounced,
  });
}
