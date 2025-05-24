import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';

type LazyQueryOptions<TQueryFnData, TError, TData> = Omit<
  UseQueryOptions<TQueryFnData, TError, TData>,
  'enabled' | 'queryKey' | 'queryFn'
> & {
  queryKey: readonly unknown[];
  queryFn: () => Promise<TQueryFnData>;
};

/**
 * A custom hook that Custom hook to delay query execution until explicitly triggered.
 * @template TQueryFnData - The raw data type returned by the query function.
 * @template TError - The error type that may be thrown by the query function.
 * @template TData - The transformed data type returned by the query result (defaults to `TQueryFnData`).
 *
 * @param {Object} params - The parameters to configure the hook.
 * @param {QueryKey} params.queryKey - The base query key for identifying the query in the cache.
 * @param {(...args) => Promise<TQueryFnData>} params.queryFn - The function that fetches the data.
 * @param {...any} params.queryOptions - Additional options passed to React Query's `useQuery`.
 *
 * @returns {UseQueryResult<TData, TError>} The query result
 * @example
 * ```tsx
 * const {
 *   data,
 *   refetch,
 *   isLoading,
 * } = useLazyQuery({
 *   queryKey: ['users'],
 *   queryFn: (page, limit) => fetchUsers(page, limit),
 * });
 * 
 * refetch();
 * ```
 */
export default function useLazyQuery<TQueryFnData = unknown, TError = unknown, TData = TQueryFnData>({
  queryKey,
  queryFn,
  ...queryOptions
}: LazyQueryOptions<TQueryFnData, TError, TData>): UseQueryResult<TData, TError> {
  return useQuery<TQueryFnData, TError, TData>({
    ...queryOptions,
    queryKey,
    queryFn,
    enabled: false,
  });
}
