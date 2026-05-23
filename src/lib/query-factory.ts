import { queryOptions } from '@tanstack/react-query';
import type { QueryKey } from '@tanstack/react-query';

type CreateQueryOptions<TData> = {
  initialData?: TData | (() => TData);
  staleTime?: number;
};

export function createQuery<TData, TQueryKey extends QueryKey>(
  queryKey: TQueryKey,
  queryFn: () => TData | Promise<TData>,
  options?: CreateQueryOptions<TData>
) {
  if (options && 'initialData' in options) {
    return queryOptions({
      queryKey,
      queryFn,
      initialData: options.initialData,
      staleTime: options.staleTime ?? Infinity,
    });
  }

  return queryOptions({
    queryKey,
    queryFn,
    initialData: queryFn as () => TData,
    staleTime: options?.staleTime ?? Infinity,
  });
}
