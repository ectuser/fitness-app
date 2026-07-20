import {
  duplicateWorkoutTemplate,
  getCompletedWorkouts,
  getNextWorkout,
  getUpcomingWorkouts,
} from './workout-helpers'
import {
  finishWorkoutRecord,
  reopenWorkoutRecord,
  saveWorkoutProgressRecord,
} from './workout-commands'
import type { Workout, WorkoutExercise } from '@/types'
import { WorkoutSchema } from '@/lib/fitness-schemas'
import { STORAGE_KEYS, getFromStorage, saveToStorage } from '@/lib/storage'

export type CreateWorkoutInput = Omit<Workout, 'id' | 'createdAt' | 'updatedAt'>

export interface UpdateWorkoutDetailsInput {
  id: string
  updates: Pick<Workout, 'name' | 'date'>
}

export interface SaveWorkoutProgressInput {
  id: string
  exercises: Array<WorkoutExercise>
}

export interface ReplaceWorkoutExercisesInput {
  id: string
  exercises: Array<WorkoutExercise>
}

export interface FinishWorkoutInput {
  id: string
  exercises?: Array<WorkoutExercise>
}

export interface ReopenWorkoutInput {
  id: string
}

export interface DeleteWorkoutInput {
  id: string
}

export interface DuplicateWorkoutInput {
  id: string
  options?: { date?: string; nameSuffix?: string }
}

export function readWorkoutLibrarySnapshot(): Array<Workout> {
  const storedWorkouts = getFromStorage<unknown>(STORAGE_KEYS.WORKOUTS, [])
  const workouts = Array.isArray(storedWorkouts)
    ? storedWorkouts.flatMap((storedWorkout) => {
        const migratedWorkout = migrateStoredWorkout(storedWorkout)
        const parsedWorkout = WorkoutSchema.safeParse(migratedWorkout)

        return parsedWorkout.success ? [parsedWorkout.data] : []
      })
    : []

  saveToStorage(STORAGE_KEYS.WORKOUTS, workouts)

  return workouts
}

function migrateStoredWorkout(storedWorkout: unknown): unknown {
  if (
    !storedWorkout ||
    typeof storedWorkout !== 'object' ||
    !('isCompleted' in storedWorkout) ||
    typeof storedWorkout.isCompleted !== 'boolean'
  ) {
    return storedWorkout
  }

  const record = storedWorkout as Record<string, unknown>
  const { isCompleted, ...workout } = record

  return {
    ...workout,
    status: isCompleted ? 'completed' : 'planned',
    completedAt: isCompleted
      ? (workout.completedAt ?? workout.updatedAt ?? workout.createdAt)
      : undefined,
  }
}

export function createWorkoutRecord(
  workout: CreateWorkoutInput,
  createId = () => crypto.randomUUID(),
  now = new Date().toISOString(),
): Workout {
  return {
    ...workout,
    id: createId(),
    createdAt: now,
    updatedAt: now,
  }
}

export function updateWorkoutRecords(
  workouts: Array<Workout>,
  id: string,
  updates: Pick<Workout, 'name' | 'date'>,
  now = new Date().toISOString(),
): Array<Workout> {
  return workouts.map((workout) =>
    workout.id === id ? { ...workout, ...updates, updatedAt: now } : workout,
  )
}

export function deleteWorkoutRecord(
  workouts: Array<Workout>,
  id: string,
): Array<Workout> {
  return workouts.filter((workout) => workout.id !== id)
}

export function duplicateWorkoutRecord(
  workouts: Array<Workout>,
  id: string,
  options?: { date?: string; nameSuffix?: string },
): Workout | null {
  const workout = workouts.find((entry) => entry.id === id)

  if (!workout) {
    return null
  }

  return createWorkoutRecord(
    duplicateWorkoutTemplate(workout, options),
    () => crypto.randomUUID(),
    new Date().toISOString(),
  )
}

export function getDerivedWorkoutData(workouts: Array<Workout>) {
  return {
    upcomingWorkouts: getUpcomingWorkouts(workouts),
    completedWorkouts: getCompletedWorkouts(workouts),
    nextWorkout: getNextWorkout(workouts),
  }
}

export async function listWorkouts(): Promise<Array<Workout>> {
  return readWorkoutLibrarySnapshot()
}

export async function createWorkout(
  workout: CreateWorkoutInput,
): Promise<Workout> {
  const nextWorkout = createWorkoutRecord(workout)

  const validatedWorkout = WorkoutSchema.parse(nextWorkout)
  saveToStorage(STORAGE_KEYS.WORKOUTS, [
    ...readWorkoutLibrarySnapshot(),
    validatedWorkout,
  ])

  return validatedWorkout
}

export async function updateWorkoutDetails({
  id,
  updates,
}: UpdateWorkoutDetailsInput): Promise<Workout> {
  const nextWorkouts = updateWorkoutRecords(
    readWorkoutLibrarySnapshot(),
    id,
    updates,
  )
  const updatedWorkout = nextWorkouts.find((workout) => workout.id === id)

  if (!updatedWorkout) {
    throw new Error('Workout not found')
  }

  const validatedWorkout = WorkoutSchema.parse(updatedWorkout)
  saveToStorage(
    STORAGE_KEYS.WORKOUTS,
    nextWorkouts.map((workout) =>
      workout.id === id ? validatedWorkout : workout,
    ),
  )

  return validatedWorkout
}

function updateWorkoutRecord(
  id: string,
  transform: (workout: Workout) => Workout,
): Workout {
  const nextWorkouts = readWorkoutLibrarySnapshot().map((workout) =>
    workout.id === id ? transform(workout) : workout,
  )
  const updatedWorkout = nextWorkouts.find((workout) => workout.id === id)

  if (!updatedWorkout) {
    throw new Error('Workout not found')
  }

  const validatedWorkout = WorkoutSchema.parse(updatedWorkout)
  saveToStorage(
    STORAGE_KEYS.WORKOUTS,
    nextWorkouts.map((workout) =>
      workout.id === id ? validatedWorkout : workout,
    ),
  )
  return validatedWorkout
}

export async function saveWorkoutProgress({
  id,
  exercises,
}: SaveWorkoutProgressInput): Promise<Workout> {
  return updateWorkoutRecord(id, (workout) =>
    saveWorkoutProgressRecord(workout, exercises),
  )
}

export async function replaceWorkoutExercises({
  id,
  exercises,
}: ReplaceWorkoutExercisesInput): Promise<Workout> {
  return updateWorkoutRecord(id, (workout) => ({
    ...workout,
    exercises,
    updatedAt: new Date().toISOString(),
  }))
}

export async function finishWorkout({
  id,
  exercises,
}: FinishWorkoutInput): Promise<Workout> {
  return updateWorkoutRecord(id, (workout) =>
    finishWorkoutRecord(
      exercises ? saveWorkoutProgressRecord(workout, exercises) : workout,
    ),
  )
}

export async function reopenWorkout({
  id,
}: ReopenWorkoutInput): Promise<Workout> {
  return updateWorkoutRecord(id, (workout) => reopenWorkoutRecord(workout))
}

export async function deleteWorkout({ id }: DeleteWorkoutInput): Promise<void> {
  saveToStorage(
    STORAGE_KEYS.WORKOUTS,
    deleteWorkoutRecord(readWorkoutLibrarySnapshot(), id),
  )
}

export async function duplicateWorkout({
  id,
  options,
}: DuplicateWorkoutInput): Promise<Workout | null> {
  const workouts = readWorkoutLibrarySnapshot()
  const duplicatedWorkout = duplicateWorkoutRecord(workouts, id, options)

  if (!duplicatedWorkout) {
    return null
  }

  const validatedWorkout = WorkoutSchema.parse(duplicatedWorkout)
  saveToStorage(STORAGE_KEYS.WORKOUTS, [...workouts, validatedWorkout])

  return validatedWorkout
}
