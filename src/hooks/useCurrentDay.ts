import { useEffect, useState } from 'react'
import {
  addLocalDays,
  startOfLocalDay,
} from '@/features/training-history/training-history-projections'

/**
 * Returns today's local date (at local midnight) and updates it when the
 * local day changes: via one timer for the next midnight, and on return to
 * a visible page, since background timers can be throttled or suspended.
 */
export function useCurrentDay(): Date {
  const [today, setToday] = useState(() => startOfLocalDay(new Date()))

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined

    const sync = () => {
      const now = new Date()
      const current = startOfLocalDay(now)
      setToday((previous) =>
        previous.getTime() === current.getTime() ? previous : current,
      )

      clearTimeout(timeoutId)
      timeoutId = setTimeout(
        sync,
        Math.max(addLocalDays(now, 1).getTime() - now.getTime(), 0),
      )
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') sync()
    }

    sync()
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  return today
}
