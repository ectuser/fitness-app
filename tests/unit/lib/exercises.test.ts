import { describe, expect, it } from 'vitest';
import { ALL_MUSCLE_GROUPS, getOrderedMuscleGroups, MUSCLE_GROUP_ORDER } from '@/lib/exercises';
import { exercises } from '../fixtures';

describe('exercise helpers', () => {
  it('exports the supported muscle group lists', () => {
    expect(ALL_MUSCLE_GROUPS).toContain('Chest');
    expect(MUSCLE_GROUP_ORDER.at(-1)).toBe('None');
  });

  it('returns unique muscle groups in display order', () => {
    expect(getOrderedMuscleGroups(exercises)).toEqual([
      'Chest',
      'Back',
      'Core',
      'Biceps',
      'Triceps',
    ]);
  });

  it('pushes unknown groups after known ones and sorts unknowns alphabetically', () => {
    expect(
      getOrderedMuscleGroups([
        {
          ...exercises[0],
          muscleGroups: ['Zulu' as never, 'Chest', 'Alpha' as never],
        },
      ])
    ).toEqual(['Chest', 'Alpha', 'Zulu']);
  });
});
