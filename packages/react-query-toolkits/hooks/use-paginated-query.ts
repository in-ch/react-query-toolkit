import { useState } from 'react';
import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';

type UsePaginatedQueryParams<TQueryFnData, TError, TData> = {
  queryKey: any[];
  queryFn: (page: number, limit: number) => Promise<TQueryFnData>;
  initialPage?: number;
  initialLimit?: number;
} & Omit<UseQueryOptions<TQueryFnData, TError, TData>, 'queryKey' | 'queryFn'>;

/**
 * A custom hook that simplifies paginated data fetching using React Query.
 *
 * @template TQueryFnData - The raw data type returned by the query function.
 * @template TError - The error type that may be thrown by the query function.
 * @template TData - The transformed data type returned by the query result (defaults to `TQueryFnData`).
 *
 * @param {Object} params - The parameters to configure the hook.
 * @param {QueryKey} params.queryKey - The base query key for identifying the query in the cache.
 * @param {(page: number, limit: number) => Promise<TQueryFnData>} params.queryFn - The function that fetches the data using the current `page` and `limit`.
 * @param {number} [params.initialPage=1] - The initial page number.
 * @param {number} [params.initialLimit=10] - The initial number of items per page.
 * @param {Omit<UseQueryOptions<TQueryFnData, TError, TData>, 'queryKey' | 'queryFn'>} [params.queryOptions] - Additional React Query options.
 *
 * @returns {UseQueryResult<TData, TError> & {
 *   page: number;
 *   setPage: React.Dispatch<React.SetStateAction<number>>;
 *   limit: number;
 *   setLimit: React.Dispatch<React.SetStateAction<number>>;
 * }} The query result, along with pagination state and setters.
 *
 * @example
 * ```tsx
 * const {
 *   data,
 *   isLoading,
 *   page,
 *   setPage,
 *   limit,
 *   setLimit,
 * } = usePaginatedQuery({
 *   queryKey: ['users'],
 *   queryFn: (page, limit) => fetchUsers(page, limit),
 *   initialPage: 1,
 *   initialLimit: 20,
 * });
 * ```
 */
export default function usePaginatedQuery<TQueryFnData = unknown, TError = unknown, TData = TQueryFnData>({
  queryKey,
  queryFn,
  initialPage = 1,
  initialLimit = 10,
  ...queryOptions
}: UsePaginatedQueryParams<TQueryFnData, TError, TData>): UseQueryResult<TData, TError> & {
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  limit: number;
  setLimit: React.Dispatch<React.SetStateAction<number>>;
} {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  const queryResult = useQuery({
    ...queryOptions,
    queryKey: [...queryKey, page, limit],
    queryFn: () => queryFn(page, limit),
  });

  return {
    ...queryResult,
    page,
    setPage,
    limit,
    setLimit,
  };
}
