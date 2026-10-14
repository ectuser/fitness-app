import type { Exercise, MuscleGroup } from '@/types'

const VALID_MUSCLE_GROUPS = new Set<MuscleGroup>([
  'Chest',
  'Back',
  'Shoulders',
  'Core',
  'Biceps',
  'Triceps',
  'Quads',
  'Hamstrings',
  'Glutes',
  'Calves',
  'Arms (Legacy)',
  'Legs (Legacy)',
  'None',
])

const LEGACY_MIGRATION_MAP: Partial<Record<string, MuscleGroup>> = {
  Arms: 'Arms (Legacy)',
  Legs: 'Legs (Legacy)',
  'Full Body': 'None',
}

function normalizeMuscleGroup(group: string): MuscleGroup | null {
  const trimmedGroup = group.trim()
  if (!trimmedGroup) {
    return null
  }

  const legacyGroup = LEGACY_MIGRATION_MAP[trimmedGroup]
  if (legacyGroup) {
    return legacyGroup
  }

  if (VALID_MUSCLE_GROUPS.has(trimmedGroup as MuscleGroup)) {
    return trimmedGroup as MuscleGroup
  }

  return null
}

export function migrateExerciseMuscleGroups(
  muscleGroups: Array<string>,
): Array<MuscleGroup> {
  const migratedGroups = Array.from(
    new Set(
      muscleGroups
        .map((group) => normalizeMuscleGroup(group))
        .filter((group): group is MuscleGroup => group !== null),
    ),
  )

  if (migratedGroups.length === 0) {
    return ['None']
  }

  return migratedGroups
}

export function migrateExercises<T extends Pick<Exercise, 'muscleGroups'>>(
  exercises: Array<T>,
): Array<T> {
  return exercises.map((exercise) => ({
    ...exercise,
    muscleGroups: migrateExerciseMuscleGroups(exercise.muscleGroups),
  }))
}
