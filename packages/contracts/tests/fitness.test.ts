import { describe, expect, it } from 'vitest'
import { ExerciseSchema, WorkoutSchema } from '../src/index'

const now = '2026-10-14T10:00:00.000Z'

const exercise = {
  id: 'exercise-1',
  name: 'Bench Press',
  muscleGroups: ['Chest'],
  isCustom: false,
  createdAt: now,
}

const workout = {
  id: 'workout-1',
  name: 'Push day',
  date: '2026-10-14',
  exercises: [],
  status: 'planned',
  createdAt: now,
  updatedAt: now,
}

describe('fitness contracts', () => {
  it('accepts a valid exercise', () => {
    expect(ExerciseSchema.safeParse(exercise).success).toBe(true)
  })

  it('rejects an exercise with unknown fields or no muscle group', () => {
    expect(ExerciseSchema.safeParse({ ...exercise, extra: true }).success).toBe(
      false,
    )
    expect(
      ExerciseSchema.safeParse({ ...exercise, muscleGroups: [] }).success,
    ).toBe(false)
  })

  it('accepts a planned workout without completedAt', () => {
    expect(WorkoutSchema.safeParse(workout).success).toBe(true)
  })

  it('requires completedAt for completed workouts only', () => {
    expect(
      WorkoutSchema.safeParse({ ...workout, status: 'completed' }).success,
    ).toBe(false)
    expect(
      WorkoutSchema.safeParse({
        ...workout,
        status: 'completed',
        completedAt: now,
      }).success,
    ).toBe(true)
    expect(
      WorkoutSchema.safeParse({ ...workout, completedAt: now }).success,
    ).toBe(false)
  })
})
