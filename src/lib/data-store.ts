import {
  createDefaultExerciseCatalog,
  readExerciseCatalogSnapshot,
} from '@/features/exercise/exercise-source';
import { STORAGE_KEYS, getFromStorage } from '@/lib/storage';
import { DEFAULT_SETTINGS } from '@/lib/settings';
import { duplicateWorkoutTemplate, getCompletedWorkouts, getNextWorkout, getUpcomingWorkouts } from '@/lib/workouts';
import type { Exercise, Settings, Workout } from '@/types';

export interface FitnessDataState {
  exercises: Exercise[];
  settings: Settings;
  workouts: Workout[];
}

export function loadFitnessData(): FitnessDataState {
  const storedWorkouts = getFromStorage<Workout[]>(STORAGE_KEYS.WORKOUTS, []);
  const storedSettings = getFromStorage<Settings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);

  return {
    exercises: readExerciseCatalogSnapshot(),
    workouts: storedWorkouts,
    settings: storedSettings,
  };
}

export function createWorkoutRecord(
  workout: Omit<Workout, 'id' | 'createdAt' | 'updatedAt'>,
  createId = () => crypto.randomUUID(),
  now = new Date().toISOString()
): Workout {
  return {
    ...workout,
    id: createId(),
    createdAt: now,
    updatedAt: now,
  };
}

export function updateWorkoutRecords(
  workouts: Workout[],
  id: string,
  updates: Partial<Workout>,
  now = new Date().toISOString()
): Workout[] {
  return workouts.map((workout) =>
    workout.id === id ? { ...workout, ...updates, updatedAt: now } : workout
  );
}

export function deleteWorkoutRecord(workouts: Workout[], id: string): Workout[] {
  return workouts.filter((workout) => workout.id !== id);
}

export function duplicateWorkoutRecord(
  workouts: Workout[],
  id: string,
  options?: { date?: string; nameSuffix?: string }
): Workout | null {
  const workout = workouts.find((entry) => entry.id === id);

  if (!workout) {
    return null;
  }

  return createWorkoutRecord(
    duplicateWorkoutTemplate(workout, options),
    () => crypto.randomUUID(),
    new Date().toISOString()
  );
}

export function toggleWorkoutCompleteRecord(
  workouts: Workout[],
  id: string,
  now = new Date().toISOString()
): Workout[] {
  return workouts.map((workout) => {
    if (workout.id !== id) {
      return workout;
    }

    const isCompleted = !workout.isCompleted;

    return {
      ...workout,
      isCompleted,
      completedAt: isCompleted ? now : undefined,
      updatedAt: now,
    };
  });
}

export function resetFitnessData(): FitnessDataState {
  return {
    exercises: createDefaultExerciseCatalog(),
    workouts: [],
    settings: DEFAULT_SETTINGS,
  };
}

export function getDerivedWorkoutData(workouts: Workout[]) {
  return {
    upcomingWorkouts: getUpcomingWorkouts(workouts),
    completedWorkouts: getCompletedWorkouts(workouts),
    nextWorkout: getNextWorkout(workouts),
  };
}
