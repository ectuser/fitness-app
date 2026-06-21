import type { Exercise, Workout } from '@/types'
import { migrateExercises } from '@/lib/migrations'
import { initializeSeedExercises } from '@/lib/seed-data'
import { STORAGE_KEYS, getFromStorage, saveToStorage } from '@/lib/storage'

export type CreateExerciseInput = Omit<Exercise, 'id' | 'createdAt'>

export interface UpdateExerciseInput {
  id: string
  updates: Partial<Exercise>
}

export interface DeleteExerciseInput {
  id: string
}

export function createDefaultExerciseCatalog(): Array<Exercise> {
  return migrateExercises(initializeSeedExercises())
}

export function readExerciseCatalogSnapshot(): Array<Exercise> {
  const storedExercises = getFromStorage<Array<Exercise>>(STORAGE_KEYS.EXERCISES, [])
  const exercises =
    storedExercises.length === 0
      ? createDefaultExerciseCatalog()
      : migrateExercises(storedExercises)

  saveToStorage(STORAGE_KEYS.EXERCISES, exercises)

  return exercises
}

export function createExerciseRecord(
  exercise: CreateExerciseInput,
  createId = () => crypto.randomUUID(),
  now = new Date().toISOString(),
): Exercise {
  return {
    ...exercise,
    id: createId(),
    createdAt: now,
  }
}

export function updateExerciseRecords(
  exercises: Array<Exercise>,
  id: string,
  updates: Partial<Exercise>,
): Array<Exercise> {
  return exercises.map((exercise) =>
    exercise.id === id ? { ...exercise, ...updates } : exercise,
  )
}

export function deleteExerciseRecord(
  exercises: Array<Exercise>,
  workouts: Array<Workout>,
  id: string,
): Array<Exercise> {
  const isUsed = workouts.some((workout) =>
    workout.exercises.some(
      (workoutExercise) => workoutExercise.exerciseId === id,
    ),
  )

  if (isUsed) {
    throw new Error('Cannot delete exercise that is used in workouts')
  }

  return exercises.filter((exercise) => exercise.id !== id)
}

export async function listExercises(): Promise<Array<Exercise>> {
  return readExerciseCatalogSnapshot()
}

export async function createExercise(
  exercise: CreateExerciseInput,
): Promise<Exercise> {
  const nextExercise = createExerciseRecord(exercise)
  const nextExercises = [...readExerciseCatalogSnapshot(), nextExercise]

  saveToStorage(STORAGE_KEYS.EXERCISES, nextExercises)

  return nextExercise
}

export async function updateExercise({
  id,
  updates,
}: UpdateExerciseInput): Promise<Exercise> {
  const currentExercises = readExerciseCatalogSnapshot()
  const nextExercises = updateExerciseRecords(currentExercises, id, updates)
  const updatedExercise = nextExercises.find((exercise) => exercise.id === id)

  if (!updatedExercise) {
    throw new Error('Exercise not found')
  }

  saveToStorage(STORAGE_KEYS.EXERCISES, nextExercises)

  return updatedExercise
}

export async function deleteExercise({
  id,
}: DeleteExerciseInput): Promise<void> {
  const workouts = getFromStorage<Array<Workout>>(STORAGE_KEYS.WORKOUTS, [])
  const nextExercises = deleteExerciseRecord(
    readExerciseCatalogSnapshot(),
    workouts,
    id,
  )

  saveToStorage(STORAGE_KEYS.EXERCISES, nextExercises)
}
