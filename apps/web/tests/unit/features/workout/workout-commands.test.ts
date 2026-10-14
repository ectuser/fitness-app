import { describe, expect, it } from 'vitest'
import { createWorkoutExercise, upcomingWorkout } from '../../fixtures'
import {
  finishWorkoutRecord,
  reopenWorkoutRecord,
  saveWorkoutProgressRecord,
} from '@/features/workout/workout-commands'

describe('workout commands', () => {
  it('saves progress by moving a planned workout into progress', () => {
    const exercises = [createWorkoutExercise('exercise-row')]

    expect(
      saveWorkoutProgressRecord(
        upcomingWorkout,
        exercises,
        '2026-04-26T09:00:00.000Z',
      ),
    ).toMatchObject({
      status: 'in_progress',
      exercises,
      updatedAt: '2026-04-26T09:00:00.000Z',
    })
  })

  it('finishes and reopens a workout with explicit state transitions', () => {
    const finished = finishWorkoutRecord(
      upcomingWorkout,
      '2026-04-26T10:00:00.000Z',
    )

    expect(finished).toMatchObject({
      status: 'completed',
      completedAt: '2026-04-26T10:00:00.000Z',
      updatedAt: '2026-04-26T10:00:00.000Z',
    })

    expect(
      reopenWorkoutRecord(finished, '2026-04-26T11:00:00.000Z'),
    ).toMatchObject({
      status: 'in_progress',
      completedAt: undefined,
      updatedAt: '2026-04-26T11:00:00.000Z',
    })
  })
})
