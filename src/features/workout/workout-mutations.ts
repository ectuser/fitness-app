import {
  createWorkout,
  deleteWorkout,
  duplicateWorkout,
  toggleWorkoutComplete,
  updateWorkout,
} from './workout-source'
import { workoutQueryKeys } from './workout-queries'
import type { QueryClient } from '@tanstack/react-query'
import type {
  CreateWorkoutInput,
  DeleteWorkoutInput,
  DuplicateWorkoutInput,
  ToggleWorkoutCompleteInput,
  UpdateWorkoutInput,
} from './workout-source'

async function refreshWorkoutQueries(queryClient: QueryClient) {
  await queryClient.invalidateQueries({
    queryKey: workoutQueryKeys.list(),
  })
}

export const workoutMutations = {
  create: (queryClient: QueryClient) => ({
    mutationFn: createWorkout,
    onSuccess: async () => {
      await refreshWorkoutQueries(queryClient)
    },
  }),
  update: (queryClient: QueryClient) => ({
    mutationFn: updateWorkout,
    onSuccess: async () => {
      await refreshWorkoutQueries(queryClient)
    },
  }),
  delete: (queryClient: QueryClient) => ({
    mutationFn: deleteWorkout,
    onSuccess: async () => {
      await refreshWorkoutQueries(queryClient)
    },
  }),
  duplicate: (queryClient: QueryClient) => ({
    mutationFn: duplicateWorkout,
    onSuccess: async () => {
      await refreshWorkoutQueries(queryClient)
    },
  }),
  toggleComplete: (queryClient: QueryClient) => ({
    mutationFn: toggleWorkoutComplete,
    onSuccess: async () => {
      await refreshWorkoutQueries(queryClient)
    },
  }),
}

export type {
  CreateWorkoutInput,
  DeleteWorkoutInput,
  DuplicateWorkoutInput,
  ToggleWorkoutCompleteInput,
  UpdateWorkoutInput,
}
