import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clone,
  completedBenchWorkout,
  completedRowWorkout,
  exercises,
  upcomingWorkout,
} from '../fixtures'
import {
  duplicateWorkoutTemplate,
  formatWorkoutDate,
  getCompletedWorkouts,
  getNextWorkout,
  getUpcomingWorkouts,
  getWorkoutMuscleGroups,
  getWorkoutTotalSets,
} from '@/features/workout/workout-helpers'

describe('workouts helpers', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-25T09:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('formats relative workout dates', () => {
    expect(formatWorkoutDate('2026-04-25')).toBe('Today')
    expect(formatWorkoutDate('2026-04-26')).toBe('Tomorrow')
    expect(formatWorkoutDate('2026-04-24', { includeYesterday: true })).toBe(
      'Yesterday',
    )
    expect(formatWorkoutDate('2026-05-01')).toBe('May 1')
  })

  it('sorts upcoming and completed workouts separately', () => {
    const workouts = [
      upcomingWorkout,
      completedRowWorkout,
      completedBenchWorkout,
    ]

    expect(getUpcomingWorkouts(workouts).map((workout) => workout.id)).toEqual([
      upcomingWorkout.id,
    ])
    expect(getCompletedWorkouts(workouts).map((workout) => workout.id)).toEqual(
      [completedRowWorkout.id, completedBenchWorkout.id],
    )
  })

  it('returns the next workout on or after today', () => {
    const todayWorkout = clone(upcomingWorkout)
    todayWorkout.id = 'today'
    todayWorkout.date = '2026-04-25'

    expect(getNextWorkout([upcomingWorkout, todayWorkout])).toMatchObject({
      id: 'today',
    })
    expect(getNextWorkout([completedBenchWorkout])).toBeNull()
  })

  it('derives workout muscle groups and set totals', () => {
    expect(getWorkoutMuscleGroups(completedRowWorkout, exercises)).toEqual([
      'Back',
      'Biceps',
      'Chest',
      'Triceps',
    ])
    expect(getWorkoutTotalSets(completedBenchWorkout)).toBe(2)
  })

  it('duplicates workouts with fresh set ids and reset completion state', () => {
    const createSetId = vi
      .fn()
      .mockReturnValueOnce('new-set-1')
      .mockReturnValueOnce('new-set-2')

    const duplicate = duplicateWorkoutTemplate(completedBenchWorkout, {
      createSetId,
      date: '2026-04-30',
    })

    expect(duplicate).toMatchObject({
      name: 'Push Day (Copy)',
      date: '2026-04-30',
      isCompleted: false,
      completedAt: undefined,
    })
    expect(duplicate.exercises[0].sets.map((set) => set.id)).toEqual([
      'new-set-1',
      'new-set-2',
    ])
  })
})
