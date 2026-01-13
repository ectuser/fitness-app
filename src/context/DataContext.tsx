import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { Exercise, Workout, Settings, MuscleGroup } from '@/types';
import { STORAGE_KEYS, getFromStorage, saveToStorage } from '@/lib/storage';
import { initializeSeedExercises } from '@/lib/seed-data';

interface DataContextType {
  // Exercises
  exercises: Exercise[];
  addExercise: (exercise: Omit<Exercise, 'id' | 'createdAt'>) => Exercise;
  updateExercise: (id: string, updates: Partial<Exercise>) => void;
  deleteExercise: (id: string) => void;
  getExerciseById: (id: string) => Exercise | undefined;

  // Workouts
  workouts: Workout[];
  addWorkout: (workout: Omit<Workout, 'id' | 'createdAt' | 'updatedAt'>) => Workout;
  updateWorkout: (id: string, updates: Partial<Workout>) => void;
  deleteWorkout: (id: string) => void;
  duplicateWorkout: (id: string) => Workout | null;
  toggleWorkoutComplete: (id: string) => void;
  getWorkoutById: (id: string) => Workout | undefined;

  // Computed data
  upcomingWorkouts: Workout[];
  completedWorkouts: Workout[];
  nextWorkout: Workout | null;

  // Settings
  settings: Settings;
  updateSettings: (updates: Partial<Settings>) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [settings, setSettings] = useState<Settings>({ defaultWeightUnit: 'kg' });
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize from localStorage on mount
  useEffect(() => {
    const storedExercises = getFromStorage<Exercise[]>(STORAGE_KEYS.EXERCISES, []);
    const storedWorkouts = getFromStorage<Workout[]>(STORAGE_KEYS.WORKOUTS, []);
    const storedSettings = getFromStorage<Settings>(STORAGE_KEYS.SETTINGS, {
      defaultWeightUnit: 'kg',
    });

    if (storedExercises.length === 0) {
      // First load - seed exercises
      const seededExercises = initializeSeedExercises();
      setExercises(seededExercises);
    } else {
      setExercises(storedExercises);
    }

    setWorkouts(storedWorkouts);
    setSettings(storedSettings);
    setIsInitialized(true);
  }, []);

  // Sync exercises to localStorage
  useEffect(() => {
    if (isInitialized) {
      saveToStorage(STORAGE_KEYS.EXERCISES, exercises);
    }
  }, [exercises, isInitialized]);

  // Sync workouts to localStorage
  useEffect(() => {
    if (isInitialized) {
      saveToStorage(STORAGE_KEYS.WORKOUTS, workouts);
    }
  }, [workouts, isInitialized]);

  // Sync settings to localStorage
  useEffect(() => {
    if (isInitialized) {
      saveToStorage(STORAGE_KEYS.SETTINGS, settings);
    }
  }, [settings, isInitialized]);

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
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
