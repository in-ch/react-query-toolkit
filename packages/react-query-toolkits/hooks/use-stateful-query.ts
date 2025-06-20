import { useMemo } from 'react';
import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';

export interface StatefulQueryOptions<TQueryFnData, TError, TData>
  extends UseQueryOptions<TQueryFnData, TError, TData> {
  stateValues?: unknown[];
  hideRefetch?: boolean;
  refetchWarningMessage?: string;
}

/**
 * A custom hook that manages queries with state-dependent keys.
 * When queryKey includes state values, refetch is disabled to prevent
 *
 * @template TQueryFnData - The raw data type returned by the query function.
 * @template TError - The error type that may be thrown during query execution.
 * @template TData - The data type returned after any data transformation (defaults to `TQueryFnData`).
 *
 * @param {StatefulQueryOptions<TQueryFnData, TError, TData>} options - Configuration options.
 * @param {unknown[]} [options.stateValues] - State values included in queryKey.
 * @param {boolean} [options.hideRefetch=true] - Whether to hide refetch function.
 * @param {string} [options.refetchWarningMessage] - Warning message for refetch attempts.
 *
 * @returns Query result without refetch when state values are present.
 *
 * @example
 * ```typescript
 * const [searchTerm, setSearchTerm] = useState('');
 * const [filters, setFilters] = useState({});
 *
 * // refetch is automatically removed since queryKey depends on state
 * const { data, isLoading } = useStatefulQuery({
 *   queryKey: ['search', searchTerm, filters],
 *   queryFn: () => searchAPI(searchTerm, filters),
 *   stateValues: [searchTerm, filters], // Explicitly mark state dependencies
 * });
 *
 * setSearchTerm('new search');
 * ```
 */
export default function useStatefulQuery<TQueryFnData = unknown, TError = unknown, TData = TQueryFnData>({
  stateValues = [],
  hideRefetch = true,
  refetchWarningMessage = 'Manual refetch is disabled for state-dependent queries. State changes will automatically trigger refetches.',
  ...queryOptions
}: StatefulQueryOptions<TQueryFnData, TError, TData>):
  | Omit<UseQueryResult<TData, TError>, 'refetch'>
  | UseQueryResult<TData, TError> {
  const hasStateInQueryKey = useMemo(() => {
    if (stateValues.length === 0) return false;

    const queryKey = queryOptions.queryKey as unknown[];
    if (!Array.isArray(queryKey)) return false;

    return stateValues.some(stateValue =>
      queryKey.some(
        keyPart =>
          keyPart === stateValue ||
          (typeof keyPart === 'object' &&
            typeof stateValue === 'object' &&
            JSON.stringify(keyPart) === JSON.stringify(stateValue))
      )
    );
  }, [stateValues, queryOptions.queryKey]);

  const queryResult = useQuery(queryOptions);

  const warningRefetch = useMemo(() => {
    return () => {
      console.warn(refetchWarningMessage);
      console.warn('State values detected in queryKey:', stateValues);
      console.warn('Change state values instead to trigger refetch');
      return Promise.resolve(queryResult);
    };
  }, [refetchWarningMessage, stateValues, queryResult]);

  if (hasStateInQueryKey && hideRefetch) {
    const { refetch, ...resultWithoutRefetch } = queryResult;
    return resultWithoutRefetch;
  } else if (hasStateInQueryKey && !hideRefetch) {
    return {
      ...queryResult,
      refetch: warningRefetch,
    };
  }

  return queryResult;
}

/**
 * Type guard to check if the result has refetch method
 *
 * @example
 * ```typescript
 * const { data, isLoading } = useStatefulQuery({
 *   queryKey: ['search', searchTerm, filters],
 *   queryFn: () => searchAPI(searchTerm, filters),
 * });
 *
 * if (hasRefetch(result)) {
 *   result.refetch();
 * }
 * ```
 */
export function hasRefetch<T>(
  result: Omit<UseQueryResult<T>, 'refetch'> | UseQueryResult<T>
): result is UseQueryResult<T> {
  return 'refetch' in result;
}
