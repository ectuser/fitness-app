import { listExercises, readExerciseCatalogSnapshot } from './exercise-source'
import { createQuery } from '@/lib/query-factory'

export const exerciseQueryKeys = {
  all: ['exercises'] as const,
  list: () => [...exerciseQueryKeys.all, 'list'] as const,
}

export const exerciseQueries = {
  list: () =>
    createQuery(exerciseQueryKeys.list(), listExercises, {
      initialData: readExerciseCatalogSnapshot,
    }),
}
