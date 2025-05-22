import { useQueries, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { useMemo } from 'react';

type QueryConfig<TData = unknown, TError = unknown> = {
  queryKey: unknown[];
  queryFn: () => Promise<TData>;
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>;
};

type ParallelQueryResult<TData = unknown, TError = unknown> = {
  results: UseQueryResult<TData, TError>[];
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  errors: (TError | null)[];
  data: (TData | undefined)[];
  refetchAll: () => Promise<void>;
};

/**
 * A hook that allows you to run multiple queries in parallel and get the results in a single response.
 * 
 * @template TData - The data type returned by the queries.
 * @template TError - The error type returned by the queries.
 * @param {QueryConfig<TData, TError>[]} queries - An array of query configurations.
 * @returns {ParallelQueryResult<TData, TError>} A parallel query result object.
 * 
 * @example
 * ```tsx
 * const { results, isLoading, isError, isSuccess, errors, data, refetchAll } = useParallelQuery([
 *   { queryKey: ['query1'], queryFn: () => fetch('https://api.example.com/query1') },
 *   { queryKey: ['query2'], queryFn: () => fetch('https://api.example.com/query2') },
 * ]);
 * ```
 */
export default function useParallelQuery<TData = unknown, TError = unknown>(
  queries: QueryConfig<TData, TError>[]
): ParallelQueryResult<TData, TError> {
  const queryResults = useQueries({
    queries: queries.map(({ queryKey, queryFn, options }) => ({
      queryKey,
      queryFn,
      ...options,
    })),
  });

  const results = useMemo(() => {
    return {
      results: queryResults as UseQueryResult<TData, TError>[],
      isLoading: queryResults.some((result) => result.isLoading),
      isError: queryResults.some((result) => result.isError),
      isSuccess: queryResults.every((result) => result.isSuccess),
      errors: queryResults.map((result) => result.error || null) as (TError | null)[],
      data: queryResults.map((result) => result.data),
      refetchAll: async () => {
        await Promise.all(queryResults.map((result) => result.refetch()));
      },
    };
  }, [queryResults]);

  return results;
} 