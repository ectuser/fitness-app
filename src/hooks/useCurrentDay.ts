import { useEffect, useState } from 'react'

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function startOfNextDay(date: Date): Date {
  // Built from calendar fields so DST changes (23h/25h days) are handled.
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
}

/**
 * Returns today's local date (at local midnight) and updates it when the
 * local day changes: via one timer for the next midnight, and on return to
 * a visible page, since background timers can be throttled or suspended.
 */
export function useCurrentDay(): Date {
  const [today, setToday] = useState(() => startOfDay(new Date()))

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined

    const sync = () => {
      const now = new Date()
      const current = startOfDay(now)
      setToday((previous) =>
        previous.getTime() === current.getTime() ? previous : current,
      )

      clearTimeout(timeoutId)
      timeoutId = setTimeout(
        sync,
        Math.max(startOfNextDay(now).getTime() - now.getTime(), 0),
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
