import { describe, expect, it } from 'vitest'
import { exercises } from '../fixtures'
import { migrateExerciseMuscleGroups, migrateExercises } from '@/lib/migrations'

describe('migration helpers', () => {
  it('maps legacy muscle groups and falls back to None', () => {
    expect(
      migrateExerciseMuscleGroups(['Arms', 'Legs', 'Full Body', '']),
    ).toEqual(['Arms (Legacy)', 'Legs (Legacy)', 'None'])
    expect(migrateExerciseMuscleGroups(['Unknown'])).toEqual(['None'])
  })

  it('migrates exercise collections', () => {
    expect(
      migrateExercises([
        {
          ...exercises[0],
          muscleGroups: [
            'Arms',
            'Chest',
          ] as unknown as (typeof exercises)[0]['muscleGroups'],
        },
      ]),
    ).toEqual([
      {
        ...exercises[0],
        muscleGroups: ['Arms (Legacy)', 'Chest'],
      },
    ])
  })
})
