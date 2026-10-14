import {
  createExercise,
  deleteExercise,
  updateExercise,
} from './exercise-source'
import { exerciseQueryKeys } from './exercise-queries'
import type { QueryClient } from '@tanstack/react-query'
import type {
  CreateExerciseInput,
  DeleteExerciseInput,
  UpdateExerciseInput,
} from './exercise-source'

export const exerciseMutations = {
  create: (queryClient: QueryClient) => ({
    mutationFn: createExercise,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: exerciseQueryKeys.list(),
      })
    },
  }),
  update: (queryClient: QueryClient) => ({
    mutationFn: updateExercise,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: exerciseQueryKeys.list(),
      })
    },
  }),
  delete: (queryClient: QueryClient) => ({
    mutationFn: deleteExercise,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: exerciseQueryKeys.list(),
      })
    },
  }),
}

export type { CreateExerciseInput, DeleteExerciseInput, UpdateExerciseInput }
