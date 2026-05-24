import { createQuery } from '@/lib/query-factory';
import { listExercises, readExerciseCatalogSnapshot } from './exercise-source';

export const exerciseQueryKeys = {
  all: ['exercises'] as const,
  list: () => [...exerciseQueryKeys.all, 'list'] as const,
};

export const exerciseQueries = {
  list: () =>
    createQuery(exerciseQueryKeys.list(), listExercises, {
      initialData: readExerciseCatalogSnapshot,
    }),
};
