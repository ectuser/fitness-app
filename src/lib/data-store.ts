import { migrateExercises } from '@/lib/migrations';
import { initializeSeedExercises } from '@/lib/seed-data';
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
  const storedExercises = getFromStorage<Exercise[]>(STORAGE_KEYS.EXERCISES, []);
  const storedWorkouts = getFromStorage<Workout[]>(STORAGE_KEYS.WORKOUTS, []);
  const storedSettings = getFromStorage<Settings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);

  return {
    exercises:
      storedExercises.length === 0
        ? migrateExercises(initializeSeedExercises())
        : migrateExercises(storedExercises),
    workouts: storedWorkouts,
    settings: storedSettings,
  };
}

export function createExerciseRecord(
  exercise: Omit<Exercise, 'id' | 'createdAt'>,
  createId = () => crypto.randomUUID(),
  now = new Date().toISOString()
): Exercise {
  return {
    ...exercise,
    id: createId(),
    createdAt: now,
  };
}

export function updateExerciseRecords(
  exercises: Exercise[],
  id: string,
  updates: Partial<Exercise>
): Exercise[] {
  return exercises.map((exercise) => (exercise.id === id ? { ...exercise, ...updates } : exercise));
}

export function deleteExerciseRecord(exercises: Exercise[], workouts: Workout[], id: string): Exercise[] {
  const isUsed = workouts.some((workout) =>
    workout.exercises.some((workoutExercise) => workoutExercise.exerciseId === id)
  );

  if (isUsed) {
    throw new Error('Cannot delete exercise that is used in workouts');
  }

  return exercises.filter((exercise) => exercise.id !== id);
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
    exercises: migrateExercises(initializeSeedExercises()),
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
