import { STORAGE_KEYS, getFromStorage, saveToStorage } from '@/lib/storage';
import { duplicateWorkoutTemplate, getCompletedWorkouts, getNextWorkout, getUpcomingWorkouts } from './workout-helpers';
import type { Workout } from '@/types';

export type CreateWorkoutInput = Omit<Workout, 'id' | 'createdAt' | 'updatedAt'>;

export interface UpdateWorkoutInput {
  id: string;
  updates: Partial<Workout>;
}

export interface DeleteWorkoutInput {
  id: string;
}

export interface DuplicateWorkoutInput {
  id: string;
  options?: { date?: string; nameSuffix?: string };
}

export interface ToggleWorkoutCompleteInput {
  id: string;
}

export function readWorkoutLibrarySnapshot(): Workout[] {
  const workouts = getFromStorage<Workout[]>(STORAGE_KEYS.WORKOUTS, []);

  saveToStorage(STORAGE_KEYS.WORKOUTS, workouts);

  return workouts;
}

export function createWorkoutRecord(
  workout: CreateWorkoutInput,
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

export function getDerivedWorkoutData(workouts: Workout[]) {
  return {
    upcomingWorkouts: getUpcomingWorkouts(workouts),
    completedWorkouts: getCompletedWorkouts(workouts),
    nextWorkout: getNextWorkout(workouts),
  };
}

export async function listWorkouts(): Promise<Workout[]> {
  return readWorkoutLibrarySnapshot();
}

export async function createWorkout(workout: CreateWorkoutInput): Promise<Workout> {
  const nextWorkout = createWorkoutRecord(workout);

  saveToStorage(STORAGE_KEYS.WORKOUTS, [
    ...readWorkoutLibrarySnapshot(),
    nextWorkout,
  ]);

  return nextWorkout;
}

export async function updateWorkout({
  id,
  updates,
}: UpdateWorkoutInput): Promise<Workout> {
  const nextWorkouts = updateWorkoutRecords(readWorkoutLibrarySnapshot(), id, updates);
  const updatedWorkout = nextWorkouts.find((workout) => workout.id === id);

  if (!updatedWorkout) {
    throw new Error('Workout not found');
  }

  saveToStorage(STORAGE_KEYS.WORKOUTS, nextWorkouts);

  return updatedWorkout;
}

export async function deleteWorkout({ id }: DeleteWorkoutInput): Promise<void> {
  saveToStorage(
    STORAGE_KEYS.WORKOUTS,
    deleteWorkoutRecord(readWorkoutLibrarySnapshot(), id)
  );
}

export async function duplicateWorkout({
  id,
  options,
}: DuplicateWorkoutInput): Promise<Workout | null> {
  const workouts = readWorkoutLibrarySnapshot();
  const duplicatedWorkout = duplicateWorkoutRecord(workouts, id, options);

  if (!duplicatedWorkout) {
    return null;
  }

  saveToStorage(STORAGE_KEYS.WORKOUTS, [...workouts, duplicatedWorkout]);

  return duplicatedWorkout;
}

export async function toggleWorkoutComplete({
  id,
}: ToggleWorkoutCompleteInput): Promise<Workout> {
  const nextWorkouts = toggleWorkoutCompleteRecord(readWorkoutLibrarySnapshot(), id);
  const toggledWorkout = nextWorkouts.find((workout) => workout.id === id);

  if (!toggledWorkout) {
    throw new Error('Workout not found');
  }

  saveToStorage(STORAGE_KEYS.WORKOUTS, nextWorkouts);

  return toggledWorkout;
}
