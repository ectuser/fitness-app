import { useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createExerciseRecord,
  createWorkoutRecord,
  deleteExerciseRecord,
  deleteWorkoutRecord,
  duplicateWorkoutRecord,
  getDerivedWorkoutData,
  loadFitnessData,
  resetFitnessData,
  toggleWorkoutCompleteRecord,
  updateExerciseRecords,
  updateWorkoutRecords,
} from '@/lib/data-store';
import { createQuery } from '@/lib/query-factory';
import { DEFAULT_SETTINGS } from '@/lib/settings';
import { STORAGE_KEYS, getFromStorage, saveToStorage } from '@/lib/storage';
import type { Exercise, Settings, Workout } from '@/types';

export const fitnessQueryKeys = {
  all: ['fitness-data'] as const,
  exercises: () => [...fitnessQueryKeys.all, 'exercises'] as const,
  settings: () => [...fitnessQueryKeys.all, 'settings'] as const,
  workouts: () => [...fitnessQueryKeys.all, 'workouts'] as const,
};

function readExercises() {
  const exercises = loadFitnessData().exercises;
  saveToStorage(STORAGE_KEYS.EXERCISES, exercises);
  return exercises;
}

function readSettings() {
  const settings = getFromStorage<Settings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  saveToStorage(STORAGE_KEYS.SETTINGS, settings);
  return settings;
}

function readWorkouts() {
  const workouts = getFromStorage<Workout[]>(STORAGE_KEYS.WORKOUTS, []);
  saveToStorage(STORAGE_KEYS.WORKOUTS, workouts);
  return workouts;
}

const fitnessQueries = {
  exercises: () =>
    createQuery(fitnessQueryKeys.exercises(), readExercises),
  settings: () =>
    createQuery(fitnessQueryKeys.settings(), readSettings),
  workouts: () =>
    createQuery(fitnessQueryKeys.workouts(), readWorkouts),
};

function useStoredQueryData<TData>(
  queryKey: readonly unknown[],
  readData: () => TData,
  writeData: (data: TData) => void
) {
  const queryClient = useQueryClient();

  return (updater: (data: TData) => TData) => {
    const currentData = queryClient.getQueryData<TData>(queryKey) ?? readData();
    const nextData = updater(currentData);

    writeData(nextData);
    queryClient.setQueryData(queryKey, nextData);

    return nextData;
  };
}

export function useExercises() {
  const { data } = useQuery(fitnessQueries.exercises());
  const exercises = data ?? [];
  const updateStoredExercises = useStoredQueryData(
    fitnessQueryKeys.exercises(),
    readExercises,
    (nextExercises) => saveToStorage(STORAGE_KEYS.EXERCISES, nextExercises)
  );

  return {
    exercises,
    addExercise: (exercise: Omit<Exercise, 'id' | 'createdAt'>) => {
      const nextExercise = createExerciseRecord(exercise);
      updateStoredExercises((currentExercises) => [...currentExercises, nextExercise]);
      return nextExercise;
    },
    updateExercise: (id: string, updates: Partial<Exercise>) => {
      updateStoredExercises((currentExercises) =>
        updateExerciseRecords(currentExercises, id, updates)
      );
    },
    deleteExercise: (id: string) => {
      const workouts = getFromStorage<Workout[]>(STORAGE_KEYS.WORKOUTS, []);
      updateStoredExercises((currentExercises) =>
        deleteExerciseRecord(currentExercises, workouts, id)
      );
    },
    getExerciseById: (id: string) =>
      exercises.find((exercise) => exercise.id === id),
  };
}

export function useWorkouts() {
  const { data } = useQuery(fitnessQueries.workouts());
  const workouts = data ?? [];
  const updateStoredWorkouts = useStoredQueryData(
    fitnessQueryKeys.workouts(),
    readWorkouts,
    (nextWorkouts) => saveToStorage(STORAGE_KEYS.WORKOUTS, nextWorkouts)
  );
  const derivedWorkouts = useMemo(() => getDerivedWorkoutData(workouts), [workouts]);

  return {
    workouts,
    addWorkout: (workout: Omit<Workout, 'id' | 'createdAt' | 'updatedAt'>) => {
      const nextWorkout = createWorkoutRecord(workout);
      updateStoredWorkouts((currentWorkouts) => [...currentWorkouts, nextWorkout]);
      return nextWorkout;
    },
    updateWorkout: (id: string, updates: Partial<Workout>) => {
      updateStoredWorkouts((currentWorkouts) =>
        updateWorkoutRecords(currentWorkouts, id, updates)
      );
    },
    deleteWorkout: (id: string) => {
      updateStoredWorkouts((currentWorkouts) =>
        deleteWorkoutRecord(currentWorkouts, id)
      );
    },
    duplicateWorkout: (
      id: string,
      options?: { date?: string; nameSuffix?: string }
    ) => {
      const duplicatedWorkout = duplicateWorkoutRecord(workouts, id, options);

      if (duplicatedWorkout) {
        updateStoredWorkouts((currentWorkouts) => [
          ...currentWorkouts,
          duplicatedWorkout,
        ]);
      }

      return duplicatedWorkout;
    },
    toggleWorkoutComplete: (id: string) => {
      updateStoredWorkouts((currentWorkouts) =>
        toggleWorkoutCompleteRecord(currentWorkouts, id)
      );
    },
    getWorkoutById: (id: string) => workouts.find((workout) => workout.id === id),
    ...derivedWorkouts,
  };
}

export function useSettings() {
  const { data } = useQuery(fitnessQueries.settings());
  const settings = data ?? DEFAULT_SETTINGS;
  const updateStoredSettings = useStoredQueryData(
    fitnessQueryKeys.settings(),
    readSettings,
    (nextSettings) => saveToStorage(STORAGE_KEYS.SETTINGS, nextSettings)
  );

  return {
    settings,
    updateSettings: (updates: Partial<Settings>) => {
      updateStoredSettings((currentSettings) => ({ ...currentSettings, ...updates }));
    },
  };
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
