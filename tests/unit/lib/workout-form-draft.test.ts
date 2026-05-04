import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  consumeWorkoutFormDraft,
  saveWorkoutFormDraft,
} from '@/lib/workout-form-draft';
import type { WorkoutFormDraft } from '@/lib/workout-form-draft';

describe('workout form draft storage', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('saves and consumes a draft for the same workout pathname', () => {
    const draft: WorkoutFormDraft = {
      name: 'Draft Workout',
      date: '2026-05-04',
      workoutExercises: [
        {
          exerciseId: 'exercise-1',
          sets: [{ id: 'set-1', weight: 50, weightUnit: 'kg', reps: 8 }],
          order: 0,
          comment: 'Warm-up first',
        },
      ],
    };

    saveWorkoutFormDraft('/workouts/new', draft);

    expect(consumeWorkoutFormDraft('/workouts/new')).toEqual(draft);
    expect(consumeWorkoutFormDraft('/workouts/new')).toBeNull();
  });

  it('returns null for absent or invalid drafts', () => {
    expect(consumeWorkoutFormDraft('/workouts/new')).toBeNull();

    sessionStorage.setItem(
      'fitness-app-workout-form-draft:/workouts/new',
      JSON.stringify({ name: 'x', date: '2026-05-04', workoutExercises: 'wrong' })
    );

    expect(consumeWorkoutFormDraft('/workouts/new')).toBeNull();
    expect(sessionStorage.getItem('fitness-app-workout-form-draft:/workouts/new')).toBeNull();
  });

  it('swallows session storage write/read errors', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('write failed');
    });
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('read failed');
    });
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    saveWorkoutFormDraft('/workouts/new', {
      name: 'Draft',
      date: '2026-05-04',
      workoutExercises: [],
    });
    expect(consumeWorkoutFormDraft('/workouts/new')).toBeNull();

    expect(errorSpy).toHaveBeenCalled();
    setItemSpy.mockRestore();
    getItemSpy.mockRestore();
    errorSpy.mockRestore();
  });
});
