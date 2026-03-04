import { createContext } from 'react';

import type { Exercise, Settings, Workout } from '@/types';

export interface DataContextType {
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

  // Data management
  resetAllData: () => void;
}

export const DataContext = createContext<DataContextType | undefined>(undefined);
