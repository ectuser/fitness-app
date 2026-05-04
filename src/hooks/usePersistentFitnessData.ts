import { useEffect, useMemo, useState } from 'react';
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
import { STORAGE_KEYS, saveToStorage } from '@/lib/storage';
import { DEFAULT_SETTINGS } from '@/lib/settings';
import type { Exercise, Settings, Workout } from '@/types';

export interface FitnessDataValue {
  addExercise: (exercise: Omit<Exercise, 'id' | 'createdAt'>) => Exercise;
  addWorkout: (workout: Omit<Workout, 'id' | 'createdAt' | 'updatedAt'>) => Workout;
  completedWorkouts: Workout[];
  deleteExercise: (id: string) => void;
  deleteWorkout: (id: string) => void;
  duplicateWorkout: (id: string, options?: { date?: string; nameSuffix?: string }) => Workout | null;
  exercises: Exercise[];
  getExerciseById: (id: string) => Exercise | undefined;
  getWorkoutById: (id: string) => Workout | undefined;
  nextWorkout: Workout | null;
  resetAllData: () => void;
  settings: Settings;
  toggleWorkoutComplete: (id: string) => void;
  upcomingWorkouts: Workout[];
  updateExercise: (id: string, updates: Partial<Exercise>) => void;
  updateSettings: (updates: Partial<Settings>) => void;
  updateWorkout: (id: string, updates: Partial<Workout>) => void;
  workouts: Workout[];
}

export function usePersistentFitnessData(): FitnessDataValue {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initialData = loadFitnessData();
    setExercises(initialData.exercises);
    setWorkouts(initialData.workouts);
    setSettings(initialData.settings);
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      saveToStorage(STORAGE_KEYS.EXERCISES, exercises);
    }
  }, [exercises, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      saveToStorage(STORAGE_KEYS.WORKOUTS, workouts);
    }
  }, [isInitialized, workouts]);

  useEffect(() => {
    if (isInitialized) {
      saveToStorage(STORAGE_KEYS.SETTINGS, settings);
    }
  }, [isInitialized, settings]);

  const derivedWorkouts = useMemo(() => getDerivedWorkoutData(workouts), [workouts]);

  return {
    exercises,
    addExercise: (exercise) => {
      const nextExercise = createExerciseRecord(exercise);
      setExercises((currentExercises) => [...currentExercises, nextExercise]);
      return nextExercise;
    },
    updateExercise: (id, updates) => {
      setExercises((currentExercises) => updateExerciseRecords(currentExercises, id, updates));
    },
    deleteExercise: (id) => {
      setExercises(deleteExerciseRecord(exercises, workouts, id));
    },
    getExerciseById: (id) => exercises.find((exercise) => exercise.id === id),
    workouts,
    addWorkout: (workout) => {
      const nextWorkout = createWorkoutRecord(workout);
      setWorkouts((currentWorkouts) => [...currentWorkouts, nextWorkout]);
      return nextWorkout;
    },
    updateWorkout: (id, updates) => {
      setWorkouts((currentWorkouts) => updateWorkoutRecords(currentWorkouts, id, updates));
    },
    deleteWorkout: (id) => {
      setWorkouts((currentWorkouts) => deleteWorkoutRecord(currentWorkouts, id));
    },
    duplicateWorkout: (id, options) => {
      const duplicatedWorkout = duplicateWorkoutRecord(workouts, id, options);

      if (duplicatedWorkout) {
        setWorkouts((currentWorkouts) => [...currentWorkouts, duplicatedWorkout]);
      }

      return duplicatedWorkout;
    },
    toggleWorkoutComplete: (id) => {
      setWorkouts((currentWorkouts) => toggleWorkoutCompleteRecord(currentWorkouts, id));
    },
    getWorkoutById: (id) => workouts.find((workout) => workout.id === id),
    upcomingWorkouts: derivedWorkouts.upcomingWorkouts,
    completedWorkouts: derivedWorkouts.completedWorkouts,
    nextWorkout: derivedWorkouts.nextWorkout,
    settings,
    updateSettings: (updates) => {
      setSettings((currentSettings) => ({ ...currentSettings, ...updates }));
    },
    resetAllData: () => {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(STORAGE_KEYS.EXERCISES);
        localStorage.removeItem(STORAGE_KEYS.WORKOUTS);
        localStorage.removeItem(STORAGE_KEYS.SETTINGS);
        localStorage.removeItem(STORAGE_KEYS.WORKOUT_CREATE_DRAFT);
      }

      const resetState = resetFitnessData();
      setExercises(resetState.exercises);
      setWorkouts(resetState.workouts);
      setSettings(resetState.settings);
    },
  };
}
