import { createDefaultExerciseCatalog } from '@/features/exercise/exercise-source'
import { DEFAULT_SETTINGS } from '@/features/settings/settings-source'
import { migrateExercises } from '@/lib/migrations'
import { STORAGE_KEYS, removeFromStorage, saveToStorage } from '@/lib/storage'
import type { Exercise, Settings, Workout } from '@/types'

export interface ImportPayload {
  exercises: Exercise[]
  workouts: Workout[]
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

  if (
    !parsedValue.data ||
    !Array.isArray(parsedValue.data.exercises) ||
    !Array.isArray(parsedValue.data.workouts)
  ) {
    throw new Error('Invalid backup file format. Missing required data.')
  }

  return parsedValue.data
}

export function importDashboardData(data: ImportPayload): void {
  saveToStorage(STORAGE_KEYS.EXERCISES, migrateExercises(data.exercises))
  saveToStorage(STORAGE_KEYS.WORKOUTS, data.workouts)

  if (data.settings) {
    saveToStorage(STORAGE_KEYS.SETTINGS, data.settings)
  }
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
