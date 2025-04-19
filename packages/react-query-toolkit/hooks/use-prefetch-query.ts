import { useQuery, useQueryClient, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';

type PrefetchQueryOptions<TQueryFnData, TError, TData> = Omit<
  UseQueryOptions<TQueryFnData, TError, TData>,
  'enabled' | 'queryKey' | 'queryFn'
> & {
  queryKey: readonly unknown[];
  queryFn: () => Promise<TQueryFnData>;
};

/**
 * A custom hook that provides a way to prefetch data manually.
 *
 * @template TQueryFnData - The raw data type returned by the query function.
 * @template TError - The error type that may be thrown by the query function.
 * @template TData - The transformed data type returned by the query result (defaults to `TQueryFnData`).
 *
 * @param {Object} params - Configuration for the query.
 * @param {QueryKey} params.queryKey - The base query key for identifying the query in the cache.
 * @param {(page: number, limit: number) => Promise<TQueryFnData>} params.queryFn - The function that fetches the data using the current `page` and `limit`.
 * @returns {UseQueryResult<TData, TError> & {
 *   prefetch: () => Promise<void>;
 * }} An object containing `prefetch` method and the query result.
 * 
 * @example
 * ```tsx
 * const { prefetch, isLoading } = usePrefetchQuery({
 *  queryKey: ['user', userId],
 *  queryFn: () => fetchUser(userId),
 * });

 * useEffect(() => {
 *   if (shouldPrefetch) {
 *     prefetch();
 *   }
 * }, [shouldPrefetch]);
 * ```
 */

export default function usePrefetchQuery<TQueryFnData = unknown, TError = unknown, TData = TQueryFnData>({
  queryKey,
  queryFn,
  ...queryOptions
}: PrefetchQueryOptions<TQueryFnData, TError, TData>): UseQueryResult<TData, TError> & {
  prefetch: () => Promise<void>;
} {
  const queryClient = useQueryClient();

  const prefetch = async () => {
    await queryClient.prefetchQuery({
      queryKey,
      queryFn,
      ...queryOptions,
    });
  };

  const queryResult = useQuery<TQueryFnData, TError, TData>({
    queryKey,
    queryFn,
    ...queryOptions,
    enabled: false,
  });

  return { prefetch, ...queryResult };
}
