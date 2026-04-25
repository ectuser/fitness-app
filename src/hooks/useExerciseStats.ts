import { useMemo } from 'react';
import type { Workout } from '@/types';
import {
  buildExerciseHistory,
  calculateExerciseStats,
  findLastWorkoutExercise,
} from '@/lib/exercise-stats';

export function useExerciseStats(exerciseId: string, workouts: Workout[]) {
  return useMemo(() => calculateExerciseStats(exerciseId, workouts), [exerciseId, workouts]);
}

export function useExerciseHistory(exerciseId: string, workouts: Workout[]) {
  return useMemo(() => buildExerciseHistory(exerciseId, workouts), [exerciseId, workouts]);
}

export function useLastWorkoutExercise(exerciseId: string, workouts: Workout[]) {
  return useMemo(() => findLastWorkoutExercise(exerciseId, workouts), [exerciseId, workouts]);
}
