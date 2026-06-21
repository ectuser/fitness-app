import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { workoutMutations } from './workout-mutations'
import { workoutQueries } from './workout-queries'
import { getDerivedWorkoutData } from './workout-source'
import type {
  CreateWorkoutInput,
  DuplicateWorkoutInput,
  UpdateWorkoutInput,
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
  const deleteWorkoutMutation = useMutation(
    workoutMutations.delete(queryClient),
  )
  const duplicateWorkoutMutation = useMutation(
    workoutMutations.duplicate(queryClient),
  )
  const toggleCompleteMutation = useMutation(
    workoutMutations.toggleComplete(queryClient),
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
    updateWorkout: (id: string, updates: UpdateWorkoutInput['updates']) =>
      updateWorkoutMutation.mutateAsync({ id, updates }),
    deleteWorkout: (id: string) => deleteWorkoutMutation.mutateAsync({ id }),
    duplicateWorkout: (
      id: string,
      options?: DuplicateWorkoutInput['options'],
    ) => duplicateWorkoutMutation.mutateAsync({ id, options }),
    toggleWorkoutComplete: (id: string) =>
      toggleCompleteMutation.mutateAsync({ id }),
    getWorkoutById: (id: string) =>
      workouts.find((workout) => workout.id === id),
    ...derivedWorkouts,
  }
}
