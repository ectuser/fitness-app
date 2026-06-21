import { useMemo } from 'react'
import {
  buildExerciseHistory,
  calculateExerciseStats,
  findLastWorkoutExercise,
} from './training-history-projections'
import type { Workout } from '@/types'

export function useExerciseStats(exerciseId: string, workouts: Array<Workout>) {
  return useMemo(
    () => calculateExerciseStats(exerciseId, workouts),
    [exerciseId, workouts],
  )
}

export function useExerciseHistory(exerciseId: string, workouts: Array<Workout>) {
  return useMemo(
    () => buildExerciseHistory(exerciseId, workouts),
    [exerciseId, workouts],
  )
}

export function useLastWorkoutExercise(
  exerciseId: string,
  workouts: Array<Workout>,
) {
  return useMemo(
    () => findLastWorkoutExercise(exerciseId, workouts),
    [exerciseId, workouts],
  )
}
