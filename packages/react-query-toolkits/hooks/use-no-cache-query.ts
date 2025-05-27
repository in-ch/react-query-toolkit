import { useQuery, UseQueryOptions } from '@tanstack/react-query';

type UseNoCacheQueryOptions<TQueryFnData, TError, TData> = Omit<
  UseQueryOptions<TQueryFnData, TError, TData>,
  'queryKey' | 'queryFn'
> & {
  queryKey: readonly unknown[];
  queryFn: () => Promise<TQueryFnData>;
};

/**
 * A custom hook that provides a way to no cache data manually.
 *
 * @template TQueryFnData - The raw data type returned by the query function.
 * @template TError - The error type that may be thrown by the query function.
 * @template TData - The transformed data type returned by the query result (defaults to `TQueryFnData`).
 *
 * @param {Object} params - Configuration for the query.
 * @param {QueryKey} params.queryKey - The base query key for identifying the query in the cache.
 * @param {(page: number, limit: number) => Promise<TQueryFnData>} params.queryFn - The function that fetches the data using the current `page` and `limit`.
 * @returns {UseQueryResult<TData, TError>} query result.
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useNoCacheQuery({
 *      queryKey: ['user', userId],
 *      queryFn: () => fetchUser(userId),
 * });
 * ```
 */
export default function useNoCacheQuery<TQueryFnData = unknown, TError = unknown, TData = TQueryFnData>({
  queryKey,
  queryFn,
  ...queryOptions
}: UseNoCacheQueryOptions<TQueryFnData, TError, TData>) {
  const queryResult = useQuery<TQueryFnData, TError, TData>({
    ...queryOptions,
    queryKey,
    queryFn,
    staleTime: 0,
    gcTime: 0,
  });

  return { ...queryResult };
}
