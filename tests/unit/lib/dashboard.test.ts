import { describe, expect, it } from 'vitest';
import { buildExportPayload, parseImportPayload } from '@/lib/dashboard';
import { exercises, upcomingWorkout } from '../fixtures';

describe('dashboard helpers', () => {
  it('builds export payloads with metadata', () => {
    expect(
      buildExportPayload(
        {
          exercises,
          workouts: [upcomingWorkout],
          settings: { defaultWeightUnit: 'kg' },
        },
        '2026-04-25T12:00:00.000Z'
      )
    ).toEqual({
      version: '1.0',
      exportDate: '2026-04-25T12:00:00.000Z',
      data: {
        exercises,
        workouts: [upcomingWorkout],
        settings: { defaultWeightUnit: 'kg' },
      },
    });
  });

  it('parses valid import payloads and rejects invalid input', () => {
    expect(
      parseImportPayload(
        JSON.stringify({
          data: {
            exercises,
            workouts: [upcomingWorkout],
          },
        })
      )
    ).toEqual({
      exercises,
      workouts: [upcomingWorkout],
    });

    expect(() => parseImportPayload('not-json')).toThrow(
      'Failed to read backup file. Please make sure it\'s a valid JSON file.'
    );
    expect(() => parseImportPayload(JSON.stringify({ data: { exercises } }))).toThrow(
      'Invalid backup file format. Missing required data.'
    );
  });
});
