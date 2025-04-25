import { useEffect } from 'react';
import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';

type DependenciesQueryOptions<TQueryFnData, TError, TData> = UseQueryOptions<TQueryFnData, TError, TData> & {
  dependencies: unknown[];
};

/**
 * A custom hook that automatically triggers a query refetch whenever specified dependencies change.
 *
 * @template TQueryFnData - The raw data type returned by the query function.
 * @template TError - The error type that may be thrown during query execution.
 * @template TData - The data type returned after any data transformation (defaults to `TQueryFnData`).
 *
 * @param {Object} params - The parameters to configure the hook.
 * @param {QueryKey} params.queryKey - The base query key for identifying the query in the cache.
 * @param {(...args) => Promise<TQueryFnData>} params.queryFn - The function that fetches the data.
 * @param {Array<unknown>} params.dependencies - An array of values to watch; query will refetch when they change.
 * @param {...any} params.queryOptions - Additional options passed to React Query's `useQuery`.
 *
 * @returns {UseQueryResult<TData, TError>} The full result object from React Query, including `data`, `isLoading`, `refetch`, and more.
 * @example
 * ```tsx
 * const { data, isLoading } = useDependenciesQuery({
 *   queryKey: ['user'],
 *   queryFn: () => fetchUser(userId),
 *   dependencies: [userId],
 * });
 * ```
 */
export default function useDependenciesQuery<TQueryFnData = unknown, TError = unknown, TData = TQueryFnData>({
  queryKey,
  queryFn,
  dependencies,
  ...queryOptions
}: DependenciesQueryOptions<TQueryFnData, TError, TData>): UseQueryResult<TData, TError> {
  const { refetch, ...rest } = useQuery<TQueryFnData, TError, TData>({
    ...queryOptions,
    queryKey,
  });

  useEffect(() => {
    refetch();
  }, dependencies);

  return { refetch, ...rest };
}
