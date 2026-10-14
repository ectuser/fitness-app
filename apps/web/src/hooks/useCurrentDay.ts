import { useQuery } from '@tanstack/react-query'
import {
  addLocalDays,
  startOfLocalDay,
} from '@/features/training-history/training-history-projections'

const getTodayIso = () => startOfLocalDay(new Date()).toISOString()

const toDate = (iso: string) => new Date(iso)

function getMsUntilNextLocalMidnight(): number {
  const now = new Date()

  // Built from calendar fields so DST changes (23h/25h days) are handled.
  return Math.max(addLocalDays(now, 1).getTime() - now.getTime(), 0)
}

/**
 * Returns today's local date (at local midnight) and updates it when the
 * local day changes: the query refetches at the next local midnight, and
 * whenever the page regains focus or visibility, since background timers can
 * be throttled or suspended.
 *
 * The query holds an ISO string, not a Date, so structural sharing keeps the
 * same value (and no re-render) until the day actually changes.
 */
export function useCurrentDay(): Date {
  const { data } = useQuery({
    queryKey: ['current-day'],
    queryFn: getTodayIso,
    initialData: getTodayIso,
    staleTime: 0,
    gcTime: Infinity,
    refetchInterval: getMsUntilNextLocalMidnight,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: 'always',
    select: toDate,
  })

  return data
}
