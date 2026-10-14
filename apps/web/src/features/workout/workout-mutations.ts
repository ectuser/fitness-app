import {
  createWorkout,
  deleteWorkout,
  duplicateWorkout,
  finishWorkout,
  reopenWorkout,
  replaceWorkoutExercises,
  saveWorkoutProgress,
  updateWorkoutDetails,
} from './workout-source'
import { workoutQueryKeys } from './workout-queries'
import type { QueryClient } from '@tanstack/react-query'
import type {
  CreateWorkoutInput,
  DeleteWorkoutInput,
  DuplicateWorkoutInput,
  FinishWorkoutInput,
  ReopenWorkoutInput,
  ReplaceWorkoutExercisesInput,
  SaveWorkoutProgressInput,
  UpdateWorkoutDetailsInput,
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
    mutationFn: updateWorkoutDetails,
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
  saveProgress: (queryClient: QueryClient) => ({
    mutationFn: saveWorkoutProgress,
    onSuccess: async () => {
      await refreshWorkoutQueries(queryClient)
    },
  }),
  replaceExercises: (queryClient: QueryClient) => ({
    mutationFn: replaceWorkoutExercises,
    onSuccess: async () => {
      await refreshWorkoutQueries(queryClient)
    },
  }),
  finish: (queryClient: QueryClient) => ({
    mutationFn: finishWorkout,
    onSuccess: async () => {
      await refreshWorkoutQueries(queryClient)
    },
  }),
  reopen: (queryClient: QueryClient) => ({
    mutationFn: reopenWorkout,
    onSuccess: async () => {
      await refreshWorkoutQueries(queryClient)
    },
  }),
}

export type {
  CreateWorkoutInput,
  DeleteWorkoutInput,
  DuplicateWorkoutInput,
  FinishWorkoutInput,
  ReopenWorkoutInput,
  ReplaceWorkoutExercisesInput,
  SaveWorkoutProgressInput,
  UpdateWorkoutDetailsInput,
}
