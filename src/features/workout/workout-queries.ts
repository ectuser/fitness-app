import { listWorkouts, readWorkoutLibrarySnapshot } from './workout-source'
import { createQuery } from '@/lib/query-factory'

export const workoutQueryKeys = {
  all: ['workouts'] as const,
  list: () => [...workoutQueryKeys.all, 'list'] as const,
}

export const workoutQueries = {
  list: () =>
    createQuery(workoutQueryKeys.list(), listWorkouts, {
      initialData: readWorkoutLibrarySnapshot,
    }),
}
