import { createDefaultExerciseCatalog } from '../exercise/exercise-source'
import {
  DEFAULT_SETTINGS,
  readSettingsSnapshot,
} from '../settings/settings-source'
import type { Exercise, Settings, Workout } from '@/types'
import { ImportPayloadSchema } from '@/lib/fitness-schemas'
import { migrateExercises } from '@/lib/migrations'
import { STORAGE_KEYS, removeFromStorage, saveToStorage } from '@/lib/storage'

export interface ImportPayload {
  exercises: Array<Exercise>
  workouts: Array<Workout>
  settings?: Settings
}

export interface ExportPayload {
  version: string
  exportDate: string
  data: ImportPayload
}

export function buildExportPayload(
  data: ImportPayload,
  exportDate = new Date().toISOString(),
): ExportPayload {
  return {
    version: '1.0',
    exportDate,
    data,
  }
}

export function parseImportPayload(content: string): ImportPayload {
  let parsedValue: { data?: ImportPayload }

  try {
    parsedValue = JSON.parse(content) as { data?: ImportPayload }
  } catch {
    throw new Error(
      "Failed to read backup file. Please make sure it's a valid JSON file.",
    )
  }

  const importPayload = ImportPayloadSchema.safeParse(parsedValue.data)

  if (!importPayload.success) {
    throw new Error('Invalid backup file format.')
  }

  return importPayload.data
}

export function importDashboardData(data: ImportPayload): void {
  const validatedData = ImportPayloadSchema.parse(data)

  saveToStorage(
    STORAGE_KEYS.EXERCISES,
    migrateExercises(validatedData.exercises),
  )
  saveToStorage(STORAGE_KEYS.WORKOUTS, validatedData.workouts)

  saveToStorage(
    STORAGE_KEYS.SETTINGS,
    validatedData.settings
      ? { ...DEFAULT_SETTINGS, ...validatedData.settings }
      : readSettingsSnapshot(),
  )
}

export function resetDashboardData(): Required<ImportPayload> {
  const resetState = {
    exercises: createDefaultExerciseCatalog(),
    workouts: [],
    settings: DEFAULT_SETTINGS,
  }

  removeFromStorage(STORAGE_KEYS.WORKOUT_CREATE_DRAFT)
  saveToStorage(STORAGE_KEYS.EXERCISES, resetState.exercises)
  saveToStorage(STORAGE_KEYS.WORKOUTS, resetState.workouts)
  saveToStorage(STORAGE_KEYS.SETTINGS, resetState.settings)

  return resetState
}
