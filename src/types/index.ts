// Core type definitions for the Fitness Workout Tracker app

export type MuscleGroup =
  | 'Chest'
  | 'Back'
  | 'Shoulders'
  | 'Core'
  | 'Biceps'
  | 'Triceps'
  | 'Quads'
  | 'Hamstrings'
  | 'Glutes'
  | 'Calves'
  | 'Arms (Legacy)'
  | 'Legs (Legacy)'
  | 'None'

export type WeightUnit = 'kg' | 'lb'
export type ThemeMode = 'light' | 'dark' | 'system'
export type WorkoutStatus = 'planned' | 'in_progress' | 'completed'

export interface Exercise {
  id: string
  name: string
  muscleGroups: Array<MuscleGroup>
  comments?: string
  isCustom: boolean
  createdAt: string
}

export interface Set {
  id: string
  weight: number
  weightUnit: WeightUnit
  reps: number
}

export interface WorkoutExercise {
  exerciseId: string
  sets: Array<Set>
  order: number
  comment?: string
}

export interface Workout {
  id: string
  name: string
  date: string // YYYY-MM-DD format
  exercises: Array<WorkoutExercise>
  status: WorkoutStatus
  completedAt?: string
  createdAt: string
  updatedAt: string
}

// Workouts have three explicit lifecycle states:
// planned, in_progress, and completed.
// Only completed workouts contribute to exercise statistics.

export interface Settings {
  defaultWeightUnit: WeightUnit
  themeMode: ThemeMode
}

// Derived types for UI display
export interface ExerciseStats {
  exerciseId: string
  maxWeight: number
  maxWeightReps: number
  maxWeightUnit: WeightUnit
  lastWeight?: number
  lastWeightReps?: number
  lastWeightUnit?: WeightUnit
  totalSets: number
  lastPerformed?: string
}

export interface WorkoutHistory {
  workoutId: string
  workoutName: string
  date: string
  setData: Array<Set>
}
