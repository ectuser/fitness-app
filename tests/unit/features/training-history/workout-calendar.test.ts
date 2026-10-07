import { describe, expect, it } from 'vitest'
import { completedBenchWorkout, upcomingWorkout } from '../../fixtures'
import type { Workout } from '@/types'
import { buildWorkoutCalendar } from '@/features/training-history/training-history-projections'

// Wednesday 7 Oct 2026, local time.
const today = new Date(2026, 9, 7, 9, 0)

function completedAt(id: string, completedAtLocal: Date): Workout {
  return {
    ...completedBenchWorkout,
    id,
    status: 'completed',
    completedAt: completedAtLocal.toISOString(),
  }
}

function cellFor(cells: ReturnType<typeof buildWorkoutCalendar>, date: string) {
  const cell = cells.find((candidate) => candidate.date === date)
  if (!cell) {
    throw new Error(`No cell for ${date}`)
  }
  return cell
}

describe('buildWorkoutCalendar', () => {
  it('covers the 30 local days ending today as in-window cells', () => {
    const cells = buildWorkoutCalendar([], today)
    const inWindow = cells.filter((cell) => cell.isInWindow)

    expect(inWindow).toHaveLength(30)
    expect(inWindow[0].date).toBe('2026-09-08')
    expect(inWindow[29].date).toBe('2026-10-07')
  })

  it('aligns to Monday-first weeks with placeholders around the window', () => {
    const cells = buildWorkoutCalendar([], today)

    expect(cells).toHaveLength(35)
    expect(cells[0].date).toBe('2026-09-07')
    expect(cells[0].isInWindow).toBe(false)
    expect(cells[1].date).toBe('2026-09-08')
    expect(cells[1].isInWindow).toBe(true)
    expect(cells.slice(31).map((cell) => cell.date)).toEqual([
      '2026-10-08',
      '2026-10-09',
      '2026-10-10',
      '2026-10-11',
    ])
    expect(cells.slice(31).every((cell) => !cell.isInWindow)).toBe(true)
    expect(cells.slice(31).every((cell) => cell.workoutCount === 0)).toBe(true)
  })

  it('has no trailing placeholders when today is Sunday', () => {
    // Sunday 11 Oct 2026: window is Sat 12 Sep .. Sun 11 Oct.
    const cells = buildWorkoutCalendar([], new Date(2026, 9, 11, 12, 0))

    expect(cells).toHaveLength(35)
    expect(cells[0].date).toBe('2026-09-07')
    expect(cells.slice(0, 5).every((cell) => !cell.isInWindow)).toBe(true)
    expect(cells[5].date).toBe('2026-09-12')
    expect(cells[5].isInWindow).toBe(true)
    expect(cells[34].date).toBe('2026-10-11')
    expect(cells[34].isInWindow).toBe(true)
    expect(cells[34].isToday).toBe(true)
  })

  it('exposes the day of month for every cell', () => {
    const cells = buildWorkoutCalendar([], today)

    expect(cellFor(cells, '2026-09-30').dayOfMonth).toBe(30)
    expect(cellFor(cells, '2026-10-01').dayOfMonth).toBe(1)
  })

  it('flags only today', () => {
    const cells = buildWorkoutCalendar([], today)

    expect(
      cells.filter((cell) => cell.isToday).map((cell) => cell.date),
    ).toEqual(['2026-10-07'])
  })

  it('leaves every cell empty when there are no completed workouts', () => {
    const cells = buildWorkoutCalendar([upcomingWorkout], today)

    expect(cells.every((cell) => cell.workoutCount === 0)).toBe(true)
  })

  it('counts multiple completed workouts on the same local day', () => {
    const cells = buildWorkoutCalendar(
      [
        completedAt('a', new Date(2026, 9, 5, 7, 0)),
        completedAt('b', new Date(2026, 9, 5, 19, 0)),
        completedAt('c', new Date(2026, 9, 6, 8, 0)),
      ],
      today,
    )

    expect(cellFor(cells, '2026-10-05').workoutCount).toBe(2)
    expect(cellFor(cells, '2026-10-06').workoutCount).toBe(1)
    expect(cellFor(cells, '2026-10-04').workoutCount).toBe(0)
  })

  it('places a workout on the local day of its completion time near midnight', () => {
    const cells = buildWorkoutCalendar(
      [
        completedAt('late', new Date(2026, 9, 5, 23, 30)),
        completedAt('early', new Date(2026, 9, 6, 0, 15)),
      ],
      today,
    )

    expect(cellFor(cells, '2026-10-05').workoutCount).toBe(1)
    expect(cellFor(cells, '2026-10-06').workoutCount).toBe(1)
  })

  it('ignores planned and in-progress workouts', () => {
    const cells = buildWorkoutCalendar(
      [
        { ...upcomingWorkout, date: '2026-10-05', status: 'planned' },
        {
          ...upcomingWorkout,
          id: 'in-progress',
          date: '2026-10-06',
          status: 'in_progress',
        },
      ],
      today,
    )

    expect(cells.every((cell) => cell.workoutCount === 0)).toBe(true)
  })

  it('ignores completed workouts outside the window', () => {
    const cells = buildWorkoutCalendar(
      [completedAt('old', new Date(2026, 8, 1, 10, 0))],
      today,
    )

    expect(cells.every((cell) => cell.workoutCount === 0)).toBe(true)
  })
})
