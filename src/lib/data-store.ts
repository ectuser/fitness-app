import { readExerciseCatalogSnapshot } from '@/features/exercise/exercise-source'
import { readWorkoutLibrarySnapshot } from '@/features/workout/workout-source'
import { readSettingsSnapshot } from '@/features/settings/settings-source'
import type { Exercise, Settings, Workout } from '@/types'

export {
  createWorkoutRecord,
  deleteWorkoutRecord,
  duplicateWorkoutRecord,
  getDerivedWorkoutData,
  toggleWorkoutCompleteRecord,
  updateWorkoutRecords,
} from '@/features/workout/workout-source'

export interface FitnessDataState {
  exercises: Exercise[]
  settings: Settings
  workouts: Workout[]
}

export function loadFitnessData(): FitnessDataState {
  return {
    exercises: readExerciseCatalogSnapshot(),
    workouts: readWorkoutLibrarySnapshot(),
    settings: readSettingsSnapshot(),
  }
}
