import { exerciseQueryKeys } from '@/features/exercise/exercise-queries'
import { useExercises as useFeatureExercises } from '@/features/exercise/use-exercises'
import { settingsQueryKeys } from '@/features/settings/settings-queries'
import { useSettings as useFeatureSettings } from '@/features/settings/use-settings'
import { workoutQueryKeys } from '@/features/workout/workout-queries'
import { useWorkouts as useFeatureWorkouts } from '@/features/workout/use-workouts'

export const fitnessQueryKeys = {
  all: ['fitness-data'] as const,
  exercises: exerciseQueryKeys.list,
  settings: settingsQueryKeys.detail,
  workouts: workoutQueryKeys.list,
}

export function useExercises() {
  return useFeatureExercises()
}

export function useWorkouts() {
  return useFeatureWorkouts()
}

export function useSettings() {
  return useFeatureSettings()
}
