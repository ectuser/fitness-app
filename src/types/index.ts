// Core type definitions for the Fitness Workout Tracker app

export type MuscleGroup =
  | 'Chest'
  | 'Back'
  | 'Legs'
  | 'Shoulders'
  | 'Arms'
  | 'Core'
  | 'Full Body';

export type WeightUnit = 'kg' | 'lb';

export interface Exercise {
  id: string;
  name: string;
  muscleGroups: MuscleGroup[];
  comments?: string;
  isCustom: boolean;
  createdAt: string;
}

export interface Set {
  id: string;
  weight: number;
  weightUnit: WeightUnit;
  reps: number;
}

export interface WorkoutExercise {
  exerciseId: string;
  sets: Set[];
  order: number;
}

export interface Workout {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD format
  exercises: WorkoutExercise[];
  isCompleted: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Note: Workouts can be in three states:
// 1. Planned - created but not started (isCompleted: false)
// 2. In Progress - being actively performed (isCompleted: false, but in session)
// 3. Completed - finished and logged (isCompleted: true, has completedAt)
// Only completed workouts contribute to exercise statistics.

export interface Settings {
  defaultWeightUnit: WeightUnit;
}

// Derived types for UI display
export interface ExerciseStats {
  exerciseId: string;
  maxWeight: number;
  maxWeightReps: number;
  maxWeightUnit: WeightUnit;
  lastWeight?: number;
  lastWeightReps?: number;
  lastWeightUnit?: WeightUnit;
  totalSets: number;
  lastPerformed?: string;
}

export interface WorkoutHistory {
  workoutId: string;
  workoutName: string;
  date: string;
  setData: Set[];
}
