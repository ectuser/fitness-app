import type { Exercise, MuscleGroup } from '@/types'

export const ALL_MUSCLE_GROUPS: Array<MuscleGroup> = [
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
  'None',
]

export const MUSCLE_GROUP_ORDER: Array<MuscleGroup> = [
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
]

export function getOrderedMuscleGroups(
  exercises: Array<Exercise>,
): Array<MuscleGroup> {
  const uniqueGroups = new Set<MuscleGroup>()

  exercises.forEach((exercise) => {
    exercise.muscleGroups.forEach((group) => uniqueGroups.add(group))
  })

  return Array.from(uniqueGroups).sort((a, b) => {
    const aIndex = MUSCLE_GROUP_ORDER.indexOf(a)
    const bIndex = MUSCLE_GROUP_ORDER.indexOf(b)

    if (aIndex === -1 && bIndex === -1) {
      return a.localeCompare(b)
    }

    if (aIndex === -1) {
      return 1
    }

    if (bIndex === -1) {
      return -1
    }

    return aIndex - bIndex
  })
}
