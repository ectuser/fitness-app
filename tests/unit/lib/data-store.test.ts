import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createExerciseRecord,
  createWorkoutRecord,
  deleteExerciseRecord,
  deleteWorkoutRecord,
  duplicateWorkoutRecord,
  getDerivedWorkoutData,
  loadFitnessData,
  resetFitnessData,
  toggleWorkoutCompleteRecord,
  updateExerciseRecords,
  updateWorkoutRecords,
} from '@/lib/data-store';
import { STORAGE_KEYS } from '@/lib/storage';
import { DEFAULT_SETTINGS } from '@/lib/settings';
import { clone, completedBenchWorkout, completedRowWorkout, createWorkoutExercise, exercises, upcomingWorkout } from '../fixtures';

describe('data store helpers', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('loads stored data or seeds defaults', () => {
    localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(exercises));
    localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify([upcomingWorkout]));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({ defaultWeightUnit: 'lb' }));

    expect(loadFitnessData()).toEqual({
      exercises,
      workouts: [upcomingWorkout],
      settings: { defaultWeightUnit: 'lb' },
    });

    localStorage.clear();
    vi.spyOn(globalThis.crypto, 'randomUUID').mockReturnValue('33333333-3333-3333-3333-333333333333');
    expect(loadFitnessData().settings).toEqual(DEFAULT_SETTINGS);
  });

  it('creates, updates, deletes, duplicates, and toggles records', () => {
    expect(
      createExerciseRecord(
        {
          name: 'Pull-up',
          muscleGroups: ['Back'],
          isCustom: true,
        },
        () => '44444444-4444-4444-4444-444444444444',
        '2026-04-25T10:00:00.000Z'
      )
    ).toEqual({
      id: '44444444-4444-4444-4444-444444444444',
      createdAt: '2026-04-25T10:00:00.000Z',
      name: 'Pull-up',
      muscleGroups: ['Back'],
      isCustom: true,
    });

    expect(updateExerciseRecords(exercises, 'exercise-row', { name: 'Chest Supported Row' })[1].name).toBe(
      'Chest Supported Row'
    );
    expect(deleteExerciseRecord(exercises, [], 'exercise-row')).toHaveLength(2);
    expect(() => deleteExerciseRecord(exercises, [completedRowWorkout], 'exercise-row')).toThrow(
      'Cannot delete exercise that is used in workouts'
    );

    const workout = createWorkoutRecord(
      {
        name: 'New Workout',
        date: '2026-04-25',
        exercises: [createWorkoutExercise('exercise-bench')],
        isCompleted: false,
      },
      () => '55555555-5555-5555-5555-555555555555',
      '2026-04-25T11:00:00.000Z'
    );
    expect(workout.id).toBe('55555555-5555-5555-5555-555555555555');
    expect(updateWorkoutRecords([workout], '55555555-5555-5555-5555-555555555555', { name: 'Updated' }, '2026-04-25T12:00:00.000Z')[0]).toMatchObject({
      name: 'Updated',
      updatedAt: '2026-04-25T12:00:00.000Z',
    });
    expect(deleteWorkoutRecord([workout], '55555555-5555-5555-5555-555555555555')).toEqual([]);

    vi.spyOn(globalThis.crypto, 'randomUUID').mockReturnValue('66666666-6666-6666-6666-666666666666');
    const duplicated = duplicateWorkoutRecord([completedBenchWorkout], completedBenchWorkout.id, {
      date: '2026-04-30',
    });
    expect(duplicated).toMatchObject({
      id: '66666666-6666-6666-6666-666666666666',
      date: '2026-04-30',
      isCompleted: false,
      completedAt: undefined,
    });
    expect(duplicateWorkoutRecord([], 'missing')).toBeNull();

    expect(toggleWorkoutCompleteRecord([clone(upcomingWorkout)], upcomingWorkout.id, '2026-04-25T13:00:00.000Z')[0]).toMatchObject({
      isCompleted: true,
      completedAt: '2026-04-25T13:00:00.000Z',
      updatedAt: '2026-04-25T13:00:00.000Z',
    });
  });

  it('returns derived workout data and reset state', () => {
    const derived = getDerivedWorkoutData([upcomingWorkout, completedBenchWorkout, completedRowWorkout]);

    expect(derived.upcomingWorkouts).toHaveLength(1);
    expect(derived.completedWorkouts[0].id).toBe(completedRowWorkout.id);
    expect(derived.nextWorkout?.id).toBe(upcomingWorkout.id);

    expect(resetFitnessData()).toEqual({
      exercises: expect.any(Array),
      workouts: [],
      settings: DEFAULT_SETTINGS,
    });
  });
});
