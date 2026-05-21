import { queryOptions } from '@tanstack/react-query';
import type { QueryKey } from '@tanstack/react-query';

export function createQuery<TData, TQueryKey extends QueryKey>(
  queryKey: TQueryKey,
  queryFn: () => TData
) {
  return queryOptions({
    queryKey,
    queryFn,
    initialData: queryFn,
    staleTime: Infinity,
  });
}
