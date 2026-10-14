import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { exerciseMutations } from './exercise-mutations'
import { exerciseQueries } from './exercise-queries'
import type {
  CreateExerciseInput,
  UpdateExerciseInput,
} from './exercise-mutations'

export function useExercises() {
  const queryClient = useQueryClient()
  const { data } = useQuery(exerciseQueries.list())
  const createExerciseMutation = useMutation(
    exerciseMutations.create(queryClient),
  )
  const updateExerciseMutation = useMutation(
    exerciseMutations.update(queryClient),
  )
  const deleteExerciseMutation = useMutation(
    exerciseMutations.delete(queryClient),
  )
  const exercises = data ?? []

  return {
    exercises,
    addExercise: (exercise: CreateExerciseInput) =>
      createExerciseMutation.mutateAsync(exercise),
    updateExercise: (id: string, updates: UpdateExerciseInput['updates']) =>
      updateExerciseMutation.mutateAsync({ id, updates }),
    deleteExercise: (id: string) => deleteExerciseMutation.mutateAsync({ id }),
    getExerciseById: (id: string) =>
      exercises.find((exercise) => exercise.id === id),
  }
}
