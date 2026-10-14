import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { workoutMutations } from './workout-mutations'
import { workoutQueries } from './workout-queries'
import { getDerivedWorkoutData } from './workout-source'
import type {
  CreateWorkoutInput,
  DuplicateWorkoutInput,
  UpdateWorkoutDetailsInput,
} from './workout-mutations'

export function useWorkouts() {
  const queryClient = useQueryClient()
  const { data } = useQuery(workoutQueries.list())
  const createWorkoutMutation = useMutation(
    workoutMutations.create(queryClient),
  )
  const updateWorkoutMutation = useMutation(
    workoutMutations.update(queryClient),
  )
  const saveWorkoutProgressMutation = useMutation(
    workoutMutations.saveProgress(queryClient),
  )
  const replaceWorkoutExercisesMutation = useMutation(
    workoutMutations.replaceExercises(queryClient),
  )
  const deleteWorkoutMutation = useMutation(
    workoutMutations.delete(queryClient),
  )
  const duplicateWorkoutMutation = useMutation(
    workoutMutations.duplicate(queryClient),
  )
  const finishWorkoutMutation = useMutation(
    workoutMutations.finish(queryClient),
  )
  const reopenWorkoutMutation = useMutation(
    workoutMutations.reopen(queryClient),
  )
  const workouts = data ?? []
  const derivedWorkouts = useMemo(
    () => getDerivedWorkoutData(data ?? []),
    [data],
  )

  return {
    workouts,
    addWorkout: (workout: CreateWorkoutInput) =>
      createWorkoutMutation.mutateAsync(workout),
    updateWorkoutDetails: (
      id: string,
      updates: UpdateWorkoutDetailsInput['updates'],
    ) => updateWorkoutMutation.mutateAsync({ id, updates }),
    saveWorkoutProgress: (
      id: string,
      exercises: CreateWorkoutInput['exercises'],
    ) => saveWorkoutProgressMutation.mutateAsync({ id, exercises }),
    replaceWorkoutExercises: (
      id: string,
      exercises: CreateWorkoutInput['exercises'],
    ) => replaceWorkoutExercisesMutation.mutateAsync({ id, exercises }),
    deleteWorkout: (id: string) => deleteWorkoutMutation.mutateAsync({ id }),
    duplicateWorkout: (
      id: string,
      options?: DuplicateWorkoutInput['options'],
    ) => duplicateWorkoutMutation.mutateAsync({ id, options }),
    finishWorkout: (id: string, exercises?: CreateWorkoutInput['exercises']) =>
      finishWorkoutMutation.mutateAsync({ id, exercises }),
    reopenWorkout: (id: string) => reopenWorkoutMutation.mutateAsync({ id }),
    getWorkoutById: (id: string) =>
      workouts.find((workout) => workout.id === id),
    ...derivedWorkouts,
  }
}
