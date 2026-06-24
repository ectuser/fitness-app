import type { Page } from '@playwright/test'

export const STORAGE_KEYS = {
  EXERCISES: 'fitness-app-exercises',
  WORKOUTS: 'fitness-app-workouts',
  WORKOUT_CREATE_DRAFT: 'fitness-app-workout-create-draft',
  SETTINGS: 'fitness-app-settings',
  LAST_VISITED_PATH: 'fitness-app-last-visited-path',
} as const

type WeightUnit = 'kg' | 'lb'
type ThemeMode = 'light' | 'dark' | 'system'

export interface ExerciseFixture {
  id: string
  name: string
  muscleGroups: Array<string>
  comments?: string
  isCustom: boolean
  createdAt: string
}

export interface WorkoutSetFixture {
  id: string
  weight: number
  weightUnit: WeightUnit
  reps: number
}

export interface WorkoutExerciseFixture {
  exerciseId: string
  sets: Array<WorkoutSetFixture>
  order: number
  comment?: string
}

export interface WorkoutFixture {
  id: string
  name: string
  date: string
  exercises: Array<WorkoutExerciseFixture>
  isCompleted: boolean
  completedAt?: string
  createdAt: string
  updatedAt: string
}

export interface AppStorageFixture {
  exercises?: Array<ExerciseFixture>
  workouts?: Array<WorkoutFixture>
  settings?: { defaultWeightUnit: WeightUnit; themeMode?: ThemeMode }
  lastVisitedPath?: string
}

export async function seedAppStorage(
  page: Page,
  fixture: AppStorageFixture,
): Promise<void> {
  await page.addInitScript(
    ({ fixtureData, keys }) => {
      localStorage.clear()

      if (fixtureData.exercises !== undefined) {
        localStorage.setItem(
          keys.EXERCISES,
          JSON.stringify(fixtureData.exercises),
        )
      }

      if (fixtureData.workouts !== undefined) {
        localStorage.setItem(
          keys.WORKOUTS,
          JSON.stringify(fixtureData.workouts),
        )
      }

      if (fixtureData.settings !== undefined) {
        localStorage.setItem(
          keys.SETTINGS,
          JSON.stringify(fixtureData.settings),
        )
      }

      if (fixtureData.lastVisitedPath !== undefined) {
        localStorage.setItem(
          keys.LAST_VISITED_PATH,
          JSON.stringify(fixtureData.lastVisitedPath),
        )
      }
    },
    { fixtureData: fixture, keys: STORAGE_KEYS },
  )
}

export async function clearAppStorage(page: Page): Promise<void> {
  await page.addInitScript(() => {
    localStorage.clear()
  })
}

export function buildExercise(
  overrides: Partial<ExerciseFixture> &
    Pick<ExerciseFixture, 'id' | 'name' | 'muscleGroups'>,
): ExerciseFixture {
  return {
    id: overrides.id,
    name: overrides.name,
    muscleGroups: overrides.muscleGroups,
    comments: overrides.comments,
    isCustom: overrides.isCustom ?? true,
    createdAt: overrides.createdAt ?? '2026-01-01T10:00:00.000Z',
  }
}

export function buildWorkout(
  overrides: Partial<WorkoutFixture> &
    Pick<WorkoutFixture, 'id' | 'name' | 'date' | 'exercises' | 'isCompleted'>,
): WorkoutFixture {
  return {
    id: overrides.id,
    name: overrides.name,
    date: overrides.date,
    exercises: overrides.exercises,
    isCompleted: overrides.isCompleted,
    completedAt: overrides.completedAt,
    createdAt: overrides.createdAt ?? '2026-01-01T10:00:00.000Z',
    updatedAt: overrides.updatedAt ?? '2026-01-01T10:00:00.000Z',
  }
}

export function buildWorkoutExercise(
  exerciseId: string,
  order: number,
  sets: Array<WorkoutSetFixture>,
  comment?: string,
): WorkoutExerciseFixture {
  return {
    exerciseId,
    order,
    sets,
    comment,
  }
}

export function buildSet(
  id: string,
  weight: number,
  reps: number,
  weightUnit: WeightUnit = 'kg',
): WorkoutSetFixture {
  return {
    id,
    weight,
    reps,
    weightUnit,
  }
}
