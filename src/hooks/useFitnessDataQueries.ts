import { useQueryClient } from '@tanstack/react-query';
import { resetFitnessData } from '@/lib/data-store';
import { STORAGE_KEYS, saveToStorage } from '@/lib/storage';
import { exerciseQueryKeys } from '@/features/exercise/exercise-queries';
import { useExercises as useFeatureExercises } from '@/features/exercise/use-exercises';
import { settingsQueryKeys } from '@/features/settings/settings-queries';
import { useSettings as useFeatureSettings } from '@/features/settings/use-settings';
import { workoutQueryKeys } from '@/features/workout/workout-queries';
import { useWorkouts as useFeatureWorkouts } from '@/features/workout/use-workouts';

export const fitnessQueryKeys = {
  all: ['fitness-data'] as const,
  exercises: exerciseQueryKeys.list,
  settings: settingsQueryKeys.detail,
  workouts: workoutQueryKeys.list,
};

export function useExercises() {
  return useFeatureExercises();
}

export function useWorkouts() {
  return useFeatureWorkouts();
}

export function useSettings() {
  return useFeatureSettings();
}

export function useFitnessDataReset() {
  const queryClient = useQueryClient();

  return {
    resetAllData: () => {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(STORAGE_KEYS.EXERCISES);
        localStorage.removeItem(STORAGE_KEYS.WORKOUTS);
        localStorage.removeItem(STORAGE_KEYS.SETTINGS);
        localStorage.removeItem(STORAGE_KEYS.WORKOUT_CREATE_DRAFT);
      }

      const resetState = resetFitnessData();

      saveToStorage(STORAGE_KEYS.EXERCISES, resetState.exercises);
      saveToStorage(STORAGE_KEYS.WORKOUTS, resetState.workouts);
      saveToStorage(STORAGE_KEYS.SETTINGS, resetState.settings);

      queryClient.setQueryData(fitnessQueryKeys.exercises(), resetState.exercises);
      queryClient.setQueryData(fitnessQueryKeys.workouts(), resetState.workouts);
      queryClient.setQueryData(fitnessQueryKeys.settings(), resetState.settings);
    },
  };
}
