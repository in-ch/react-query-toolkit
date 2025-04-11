import { useCallback, useEffect } from 'react';
import { QueryFunctionContext, useQuery, UseQueryResult } from '@tanstack/react-query';
import { BatchOptions } from '../types';

/**
 * A custom hook that provides a scheduled query mechanism with optional delay and interval-based refetching.
 *
 * @template TQueryFnData - The type of data returned by the query function.
 * @template TError - The type of error that may be thrown by the query function.
 * @template TData - The type of data returned by the query result (defaults to `TQueryFnData`).
 *
 * @param {BatchOptions<TQueryFnData, TError, TData>} options - The options for configuring the hook.
 * @param {number} [options.delay=0] - The delay (in milliseconds) before resolving the query function.
 * @param {QueryKey} options.queryKey - The unique key for the query.
 * @param {QueryFunction<TQueryFnData>} options.queryFn - The function to fetch the query data.
 * @param {number} [interval] - refetching interval time of the query. unit = ms
 * @param {Omit<UseQueryOptions<TQueryFnData, TError, TData>, 'queryKey' | 'queryFn'>} options.queryOptions - Additional options for the `useQuery` hook.
 *
 * @returns {UseQueryResult<TData, TError>} The result of the query, including data, status, and refetch methods.
 *
 * @example
 * ```typescript
 * const { data, refetch } = useSchedule({
 *   queryKey: ['example'],
 *   queryFn: async () => fetchExampleData(),
 *   delay: 1000,
 *   interval: 500, // Every 500 ms
 * });
 * ```
 */
export default function useSchedule<TQueryFnData = unknown, TError = unknown, TData = TQueryFnData>({
  delay = 0,
  queryKey,
  queryFn,
  interval = 0,
  ...queryOptions
}: BatchOptions<TQueryFnData, TError, TData>): UseQueryResult<TData, TError> {
  const batchedFetch = useCallback(
    (context: QueryFunctionContext) => {
      return new Promise<TQueryFnData>(resolve => {
        setTimeout(() => resolve(queryFn(context)), delay);
      });
    },
    [queryFn, delay]
  );
  const { refetch, ...rest } = useQuery({
    ...queryOptions,
    queryKey,
    queryFn: batchedFetch,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  useEffect(() => {
    if (!interval) return;
    const timer = setInterval(() => {
      refetch();
    }, interval);

    return () => clearInterval(timer);
  }, [refetch, interval]);

  return { refetch, ...rest };
}
