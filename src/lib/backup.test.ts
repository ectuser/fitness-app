import { describe, expect, it } from 'vitest';

import { createBackupPayload, parseBackupPayload } from './backup';

describe('backup helpers', () => {
  it('creates deterministic payload shape', () => {
    const fixedDate = new Date('2026-03-03T10:00:00.000Z');
    const payload = createBackupPayload(
      {
        exercises: [],
        workouts: [],
        settings: { defaultWeightUnit: 'kg' },
      },
      fixedDate
    );

    expect(payload).toEqual({
      version: '1.0',
      exportDate: '2026-03-03T10:00:00.000Z',
      data: {
        exercises: [],
        workouts: [],
        settings: { defaultWeightUnit: 'kg' },
      },
    });
  });

  it('parses and migrates backup payloads', () => {
    const result = parseBackupPayload(
      JSON.stringify({
        data: {
          exercises: [
            {
              id: 'exercise-1',
              name: 'Pull-up',
              muscleGroups: ['Arms', 'Back'],
              isCustom: false,
              createdAt: '2026-01-01T00:00:00.000Z',
            },
          ],
          workouts: [],
        },
      })
    );

    expect(result.exercises[0]?.muscleGroups).toEqual(['Arms (Legacy)', 'Back']);
    expect(result.workouts).toEqual([]);
  });

  it('throws for malformed payloads', () => {
    expect(() => parseBackupPayload('{}')).toThrow('Invalid backup file format. Missing required data.');
    expect(() => parseBackupPayload('{invalid json')).toThrow();
  });

  it('throws when required lists are missing', () => {
    const invalidPayload = JSON.stringify({ data: { exercises: {} } });
    expect(() => parseBackupPayload(invalidPayload)).toThrow('Invalid backup file format. Missing required data.');
  });

  it('uses migrated default group when exercise has no valid groups', () => {
    const result = parseBackupPayload(
      JSON.stringify({
        data: {
          exercises: [
            {
              id: 'exercise-1',
              name: 'Unknown',
              muscleGroups: ['Custom'],
              isCustom: true,
              createdAt: '2026-01-01T00:00:00.000Z',
            },
          ],
          workouts: [],
        },
      })
    );

    expect(result.exercises[0]?.muscleGroups).toEqual(['None']);
  });
});
