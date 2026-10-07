import { buildWorkoutCalendar } from '../training-history/training-history-projections'
import type { WorkoutCalendarCell } from '../training-history/training-history-projections'
import type { Workout } from '@/types'
import { Card } from '@/components/ui/card'
import { useCurrentDay } from '@/hooks/useCurrentDay'
import { cn } from '@/lib/utils'

interface WorkoutCalendarSectionProps {
  today?: Date
  workouts: Array<Workout>
}

const WEEKDAY_LABELS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
const WEEKDAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

function getCellLabel(cell: WorkoutCalendarCell, index: number): string {
  const [, month] = cell.date.split('-').map(Number)
  const date = `${WEEKDAY_NAMES[index % 7]} ${cell.dayOfMonth} ${MONTH_NAMES[month - 1]}`

  if (cell.workoutCount === 0) {
    return `${date}: rest day`
  }

  return `${date}: ${cell.workoutCount} ${
    cell.workoutCount === 1 ? 'workout' : 'workouts'
  }`
}

export function WorkoutCalendarSection({
  today: todayOverride,
  workouts,
}: WorkoutCalendarSectionProps) {
  const currentDay = useCurrentDay()
  const today = todayOverride ?? currentDay
  const cells = buildWorkoutCalendar(workouts, today)

  return (
    <section>
      <h2 className="text-lg font-semibold mb-4">Last 30 days</h2>
      <Card className="p-4">
        <div className="grid grid-cols-7 gap-1.5">
          {WEEKDAY_LABELS.map((label) => (
            <div
              key={label}
              aria-hidden="true"
              className="text-center text-xs text-muted-foreground"
            >
              {label}
            </div>
          ))}
          {cells.map((cell, index) => {
            if (!cell.isInWindow) {
              return <div key={cell.date} aria-hidden="true" />
            }

            const isTrained = cell.workoutCount > 0

            return (
              <div
                key={cell.date}
                role="img"
                aria-label={getCellLabel(cell, index)}
                aria-current={cell.isToday ? 'date' : undefined}
                className={cn(
                  'flex aspect-square items-center justify-center rounded-md text-sm',
                  isTrained
                    ? 'bg-primary text-primary-foreground font-bold'
                    : 'border border-border text-muted-foreground',
                  cell.isToday &&
                    'ring-2 ring-ring ring-offset-2 ring-offset-background',
                )}
              >
                {cell.dayOfMonth}
              </div>
            )
          })}
        </div>
      </Card>
    </section>
  )
}
