import { createQuery } from '@/lib/query-factory';
import { listWorkouts, readWorkoutLibrarySnapshot } from './workout-source';

export const workoutQueryKeys = {
  all: ['workouts'] as const,
  list: () => [...workoutQueryKeys.all, 'list'] as const,
};

export const workoutQueries = {
  list: () =>
    createQuery(workoutQueryKeys.list(), listWorkouts, {
      initialData: readWorkoutLibrarySnapshot,
    }),
};
