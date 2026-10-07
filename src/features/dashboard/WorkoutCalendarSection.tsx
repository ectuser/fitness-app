import { m } from '#/paraglide/messages'
import type { WorkoutCalendarCell } from '@/features/training-history/training-history-projections'
import type { Workout } from '@/types'
import { buildWorkoutCalendar } from '@/features/training-history/training-history-projections'
import { Card } from '@/components/ui/card'
import { useCurrentDay } from '@/hooks/useCurrentDay'
import { cn } from '@/lib/utils'

interface WorkoutCalendarSectionProps {
  workouts: Array<Workout>
}

const getWeekdayHeaderLabels = () => [
  m.tidy_azure_falcon(),
  m.keen_yellow_sloth(),
  m.shiny_purple_badger(),
  m.tender_indigo_mole(),
  m.wild_pink_bison(),
  m.shiny_navy_sloth(),
  m.gentle_silver_crane(),
]
const getWeekdayAbbreviations = () => [
  m.icy_navy_mole(),
  m.upbeat_khaki_lion(),
  m.quick_violet_hare(),
  m.gentle_violet_pony(),
  m.noble_lime_puma(),
  m.crisp_indigo_cobra(),
  m.merry_khaki_dove(),
]
const getMonthAbbreviations = () => [
  m.warm_amber_camel(),
  m.tidy_ruby_sloth(),
  m.lively_violet_koala(),
  m.happy_rose_falcon(),
  m.eager_tan_bear(),
  m.kind_jade_cobra(),
  m.gentle_cyan_frog(),
  m.rapid_ivory_finch(),
  m.sunny_ruby_zebra(),
  m.shiny_teal_yak(),
  m.dizzy_olive_elk(),
  m.icy_orange_lynx(),
]

function getCellLabel(cell: WorkoutCalendarCell, index: number): string {
  const [, month] = cell.date.split('-').map(Number)
  const labelParts = {
    weekday: getWeekdayAbbreviations()[index % 7],
    day: cell.dayOfMonth,
    month: getMonthAbbreviations()[month - 1],
  }

  if (cell.workoutCount === 0) {
    return m.silent_lime_dingo(labelParts)
  }

  return m.rapid_sage_badger({ ...labelParts, count: cell.workoutCount })
}

export function WorkoutCalendarSection({
  workouts,
}: WorkoutCalendarSectionProps) {
  const today = useCurrentDay()
  const cells = buildWorkoutCalendar(workouts, today)

  return (
    <section>
      <h2 className="text-lg font-semibold mb-4">{m.eager_cyan_bison()}</h2>
      <Card className="p-4">
        <div className="grid grid-cols-7 gap-1.5">
          {getWeekdayHeaderLabels().map((label) => (
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
                  'relative flex aspect-square items-center justify-center rounded-md text-sm',
                  isTrained
                    ? 'bg-primary text-primary-foreground font-bold'
                    : 'border border-border text-muted-foreground',
                  cell.isToday &&
                    'ring-2 ring-ring ring-offset-2 ring-offset-background',
                )}
              >
                {cell.dayOfMonth}
                {cell.workoutCount >= 2 && (
                  <span
                    aria-hidden="true"
                    className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-foreground text-[10px] font-bold leading-none text-background"
                  >
                    {cell.workoutCount}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </Card>
    </section>
  )
}
