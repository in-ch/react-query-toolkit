import { QueryFunction, UseQueryOptions } from '@tanstack/react-query';

type BatchOptions<TQueryFnData, TError, TData> = Omit<
  UseQueryOptions<TQueryFnData, TError, TData>,
  'queryFn' | 'refetchInterval' | 'refetchOnWindowFocus' | 'refetchOnMount'
> & {
  delay?: number;
  interval?: number;
  queryFn: QueryFunction<TQueryFnData>;
};

export type { BatchOptions };
