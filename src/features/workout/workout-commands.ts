import type { Workout, WorkoutExercise } from '@/types'

export function saveWorkoutProgressRecord(
  workout: Workout,
  exercises: Array<WorkoutExercise>,
  now = new Date().toISOString(),
): Workout {
  return {
    ...workout,
    exercises,
    status: workout.status === 'planned' ? 'in_progress' : workout.status,
    updatedAt: now,
  }
}

export function finishWorkoutRecord(
  workout: Workout,
  now = new Date().toISOString(),
): Workout {
  return {
    ...workout,
    status: 'completed',
    completedAt: now,
    updatedAt: now,
  }
}

export function reopenWorkoutRecord(
  workout: Workout,
  now = new Date().toISOString(),
): Workout {
  return {
    ...workout,
    status: 'in_progress',
    completedAt: undefined,
    updatedAt: now,
  }
}
