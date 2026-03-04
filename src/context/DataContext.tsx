import { useCallback, useEffect, useMemo, useState } from 'react';

import { DataContext, type DataContextType } from './DataContextValue';

import { migrateExercises } from '@/lib/migrations';
import { initializeSeedExercises } from '@/lib/seed-data';
import { STORAGE_KEYS, getFromStorage, saveToStorage } from '@/lib/storage';
import type { Exercise, Workout, Settings } from '@/types';

const DEFAULT_SETTINGS: Settings = { defaultWeightUnit: 'kg' };

function getInitialExercises(): Exercise[] {
  const storedExercises = getFromStorage<Exercise[]>(STORAGE_KEYS.EXERCISES, []);
  if (storedExercises.length === 0) {
    return migrateExercises(initializeSeedExercises());
  }

  return migrateExercises(storedExercises);
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [exercises, setExercises] = useState<Exercise[]>(() => getInitialExercises());
  const [workouts, setWorkouts] = useState<Workout[]>(() =>
    getFromStorage<Workout[]>(STORAGE_KEYS.WORKOUTS, [])
  );
  const [settings, setSettings] = useState<Settings>(() =>
    getFromStorage<Settings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS)
  );

  // Sync exercises to localStorage
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.EXERCISES, exercises);
  }, [exercises]);

  // Sync workouts to localStorage
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.WORKOUTS, workouts);
  }, [workouts]);

  // Sync settings to localStorage
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.SETTINGS, settings);
  }, [settings]);

  // Exercise CRUD operations
  const addExercise = useCallback((exercise: Omit<Exercise, 'id' | 'createdAt'>) => {
    const newExercise: Exercise = {
      ...exercise,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setExercises((prev) => [...prev, newExercise]);
    return newExercise;
  }, []);

  const updateExercise = useCallback((id: string, updates: Partial<Exercise>) => {
    setExercises((prev) =>
      prev.map((exercise) =>
        exercise.id === id ? { ...exercise, ...updates } : exercise
      )
    );
  }, []);

  const deleteExercise = useCallback((id: string) => {
    // Check if exercise is used in any workout
    const isUsed = workouts.some((workout) =>
      workout.exercises.some((we) => we.exerciseId === id)
    );

    if (isUsed) {
      throw new Error('Cannot delete exercise that is used in workouts');
    }

    setExercises((prev) => prev.filter((exercise) => exercise.id !== id));
  }, [workouts]);

  const getExerciseById = useCallback(
    (id: string) => exercises.find((e) => e.id === id),
    [exercises]
  );

  // Workout CRUD operations
  const addWorkout = useCallback((workout: Omit<Workout, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newWorkout: Workout = {
      ...workout,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    setWorkouts((prev) => [...prev, newWorkout]);
    return newWorkout;
  }, []);

  const updateWorkout = useCallback((id: string, updates: Partial<Workout>) => {
    setWorkouts((prev) =>
      prev.map((workout) =>
        workout.id === id
          ? { ...workout, ...updates, updatedAt: new Date().toISOString() }
          : workout
      )
    );
  }, []);

  const deleteWorkout = useCallback((id: string) => {
    setWorkouts((prev) => prev.filter((workout) => workout.id !== id));
  }, []);

  const duplicateWorkout = useCallback((id: string) => {
    const workout = workouts.find((w) => w.id === id);
    if (!workout) return null;

    const now = new Date().toISOString();
    const duplicated: Workout = {
      ...workout,
      id: crypto.randomUUID(),
      name: `${workout.name} (Copy)`,
      isCompleted: false,
      completedAt: undefined,
      createdAt: now,
      updatedAt: now,
    };

    setWorkouts((prev) => [...prev, duplicated]);
    return duplicated;
  }, [workouts]);

  const toggleWorkoutComplete = useCallback((id: string) => {
    setWorkouts((prev) =>
      prev.map((workout) => {
        if (workout.id === id) {
          const isCompleted = !workout.isCompleted;
          return {
            ...workout,
            isCompleted,
            completedAt: isCompleted ? new Date().toISOString() : undefined,
            updatedAt: new Date().toISOString(),
          };
        }
        return workout;
      })
    );
  }, []);

  const getWorkoutById = useCallback(
    (id: string) => workouts.find((w) => w.id === id),
    [workouts]
  );

  // Settings operations
  const updateSettings = useCallback((updates: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  // Reset all data
  const resetAllData = useCallback(() => {
    // Clear localStorage
    localStorage.removeItem(STORAGE_KEYS.EXERCISES);
    localStorage.removeItem(STORAGE_KEYS.WORKOUTS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);

    // Reset to initial state
    const seededExercises = migrateExercises(initializeSeedExercises());
    setExercises(seededExercises);
    setWorkouts([]);
    setSettings(DEFAULT_SETTINGS);
  }, []);

  // Computed values
  const upcomingWorkouts = useMemo(() => {
    return workouts
      .filter((w) => !w.isCompleted)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [workouts]);

  const completedWorkouts = useMemo(() => {
    return workouts
      .filter((w) => w.isCompleted)
      .sort((a, b) => b.date.localeCompare(a.date)); // Most recent first
  }, [workouts]);

  const nextWorkout = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const upcoming = upcomingWorkouts.filter((w) => w.date >= today);
    return upcoming.length > 0 ? upcoming[0] : null;
  }, [upcomingWorkouts]);

  const value: DataContextType = {
    exercises,
    addExercise,
    updateExercise,
    deleteExercise,
    getExerciseById,
    workouts,
    addWorkout,
    updateWorkout,
    deleteWorkout,
    duplicateWorkout,
    toggleWorkoutComplete,
    getWorkoutById,
    upcomingWorkouts,
    completedWorkouts,
    nextWorkout,
    settings,
    updateSettings,
    resetAllData,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
