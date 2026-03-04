import { describe, expect, it } from 'vitest';

import { migrateExerciseMuscleGroups, migrateExercises } from './migrations';

describe('migrations', () => {
  it('maps legacy and unknown groups to supported taxonomy', () => {
    expect(
      migrateExerciseMuscleGroups([' Arms ', 'Legs', 'Full Body', 'Back', 'Unknown', ''])
    ).toEqual(['Arms (Legacy)', 'Legs (Legacy)', 'None', 'Back']);
  });

  it('defaults to None when no valid groups are present', () => {
    expect(migrateExerciseMuscleGroups(['', '   ', 'Unknown'])).toEqual(['None']);
  });

  it('migrates muscle groups for each exercise', () => {
    const exercises = [
      { id: '1', muscleGroups: ['Arms (Legacy)', 'Back'] },
      { id: '2', muscleGroups: ['None'] },
    ];

    expect(migrateExercises(exercises)).toEqual([
      { id: '1', muscleGroups: ['Arms (Legacy)', 'Back'] },
      { id: '2', muscleGroups: ['None'] },
    ]);
  });
});
