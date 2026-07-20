import type { Exercise, Settings, Workout } from '@/types'
import { readExerciseCatalogSnapshot } from '@/features/exercise/exercise-source'
import { readWorkoutLibrarySnapshot } from '@/features/workout/workout-source'
import { readSettingsSnapshot } from '@/features/settings/settings-source'

export {
  createWorkoutRecord,
  deleteWorkoutRecord,
  duplicateWorkoutRecord,
  getDerivedWorkoutData,
  updateWorkoutRecords,
} from '@/features/workout/workout-source'
export {
  finishWorkoutRecord,
  reopenWorkoutRecord,
  saveWorkoutProgressRecord,
} from '@/features/workout/workout-commands'

export interface FitnessDataState {
  exercises: Array<Exercise>
  settings: Settings
  workouts: Array<Workout>
}

export function loadFitnessData(): FitnessDataState {
  return {
    exercises: readExerciseCatalogSnapshot(),
    workouts: readWorkoutLibrarySnapshot(),
    settings: readSettingsSnapshot(),
  }
}
