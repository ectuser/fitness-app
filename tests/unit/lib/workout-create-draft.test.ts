import { describe, expect, it } from 'vitest';
import {
  buildWorkoutCreateDraft,
  parseWorkoutCreateDraft,
  WORKOUT_CREATE_DRAFT_TTL_MS,
} from '@/lib/workout-create-draft';

const now = new Date('2026-05-04T12:00:00.000Z');

const draftInput = {
  name: 'Push Day',
  date: '2026-05-04',
  exercises: [
    {
      exerciseId: 'exercise-bench',
      order: 0,
      comment: 'Pause on chest',
      sets: [
        {
          id: 'set-1',
          weight: 100,
          weightUnit: 'kg' as const,
          reps: 5,
        },
      ],
    },
  ],
};

describe('workout create draft helpers', () => {
  it('accepts valid non-expired draft', () => {
    const draft = buildWorkoutCreateDraft(draftInput, now);

    expect(parseWorkoutCreateDraft(JSON.stringify(draft), now)).toEqual({
      status: 'valid',
      value: draft,
    });
  });

  it('rejects malformed JSON', () => {
    expect(parseWorkoutCreateDraft('{"name":"Push Day"', now)).toEqual({
      status: 'invalid',
    });
  });

  it('rejects schema-invalid data', () => {
    expect(
      parseWorkoutCreateDraft(
        JSON.stringify({
          name: 'Push Day',
          date: '2026-05-04',
          exercises: [
            {
              exerciseId: 'exercise-bench',
              order: 0,
              sets: [
                {
                  id: 'set-1',
                  weight: 100,
                  weightUnit: 'stones',
                  reps: 5,
                },
              ],
            },
          ],
          updatedAt: now.toISOString(),
        }),
        now
      )
    ).toEqual({
      status: 'invalid',
    });
  });

  it('rejects invalid date format', () => {
    expect(
      parseWorkoutCreateDraft(
        JSON.stringify({
          ...draftInput,
          date: '2026/05/04',
          updatedAt: now.toISOString(),
        }),
        now
      )
    ).toEqual({
      status: 'invalid',
    });
  });

  it('rejects impossible calendar dates', () => {
    expect(
      parseWorkoutCreateDraft(
        JSON.stringify({
          ...draftInput,
          date: '2026-99-99',
          updatedAt: now.toISOString(),
        }),
        now
      )
    ).toEqual({
      status: 'invalid',
    });

    expect(
      parseWorkoutCreateDraft(
        JSON.stringify({
          ...draftInput,
          date: '2026-02-30',
          updatedAt: now.toISOString(),
        }),
        now
      )
    ).toEqual({
      status: 'invalid',
    });
  });

  it('accepts draft at exact TTL boundary', () => {
    const boundaryUpdatedAt = new Date(now.getTime() - WORKOUT_CREATE_DRAFT_TTL_MS).toISOString();

    expect(
      parseWorkoutCreateDraft(
        JSON.stringify({
          ...draftInput,
          updatedAt: boundaryUpdatedAt,
        }),
        now
      )
    ).toEqual({
      status: 'valid',
      value: {
        ...draftInput,
        updatedAt: boundaryUpdatedAt,
      },
    });
  });

  it('rejects future timestamp draft', () => {
    const futureUpdatedAt = new Date(now.getTime() + 1).toISOString();

    expect(
      parseWorkoutCreateDraft(
        JSON.stringify({
          ...draftInput,
          updatedAt: futureUpdatedAt,
        }),
        now
      )
    ).toEqual({
      status: 'invalid',
    });
  });

  it('rejects expired draft older than 7 days', () => {
    const expiredAt = new Date(now.getTime() - WORKOUT_CREATE_DRAFT_TTL_MS - 1).toISOString();

    expect(
      parseWorkoutCreateDraft(
        JSON.stringify({
          ...draftInput,
          updatedAt: expiredAt,
        }),
        now
      )
    ).toEqual({
      status: 'expired',
    });
  });
});
