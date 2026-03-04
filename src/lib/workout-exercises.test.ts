import { describe, expect, it, vi } from 'vitest';

import {
  addOrReplaceWorkoutExercise,
  createDefaultSets,
  findLastCompletedWorkoutExercise,
  moveWorkoutExercise,
  removeWorkoutExerciseAtIndex,
  reorderWorkoutExercises,
  replaceWorkoutExerciseAtIndex,
} from './workout-exercises';

import type { Exercise, Workout, WorkoutExercise } from '@/types';


const EXERCISE_A: Exercise = {
  id: 'exercise-a',
  name: 'Bench Press',
  muscleGroups: ['Chest'],
  isCustom: false,
  createdAt: '2026-01-01T00:00:00.000Z',
};

const EXERCISE_B: Exercise = {
  id: 'exercise-b',
  name: 'Rows',
  muscleGroups: ['Back'],
  isCustom: false,
  createdAt: '2026-01-01T00:00:00.000Z',
};

const SAMPLE_WORKOUT_EXERCISE: WorkoutExercise = {
  exerciseId: EXERCISE_A.id,
  order: 0,
  sets: [
    { id: 'set-1', weight: 100, reps: 5, weightUnit: 'kg' },
    { id: 'set-2', weight: 90, reps: 8, weightUnit: 'kg' },
  ],
};

describe('workout exercise helpers', () => {
  it('finds latest completed workout exercise for a given exercise', () => {
    const workouts: Workout[] = [
      {
        id: 'w1',
        name: 'Older',
        date: '2026-01-01',
        isCompleted: true,
        exercises: [SAMPLE_WORKOUT_EXERCISE],
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'w2',
        name: 'Latest',
        date: '2026-02-01',
        isCompleted: true,
        exercises: [
          {
            exerciseId: EXERCISE_A.id,
            order: 0,
            sets: [{ id: 'set-3', weight: 110, reps: 3, weightUnit: 'kg' }],
          },
        ],
        createdAt: '2026-02-01T00:00:00.000Z',
        updatedAt: '2026-02-01T00:00:00.000Z',
      },
    ];

    expect(findLastCompletedWorkoutExercise(workouts, EXERCISE_A.id)?.sets[0]?.weight).toBe(110);
    expect(findLastCompletedWorkoutExercise(workouts, EXERCISE_B.id)).toBeNull();
  });

  it('creates default sets from prior data with fresh ids', () => {
    const uuidSpy = vi
      .spyOn(globalThis.crypto, 'randomUUID')
      .mockReturnValueOnce('11111111-1111-4111-8111-111111111111')
      .mockReturnValueOnce('22222222-2222-4222-8222-222222222222')
      .mockReturnValueOnce('33333333-3333-4333-8333-333333333333');

    const copiedSets = createDefaultSets(SAMPLE_WORKOUT_EXERCISE, 'kg');
    const fallbackSets = createDefaultSets(null, 'lb');

    expect(copiedSets).toEqual([
      { id: '11111111-1111-4111-8111-111111111111', weight: 100, reps: 5, weightUnit: 'kg' },
      { id: '22222222-2222-4222-8222-222222222222', weight: 90, reps: 8, weightUnit: 'kg' },
    ]);
    expect(fallbackSets).toEqual([
      { id: '33333333-3333-4333-8333-333333333333', weight: 0, reps: 0, weightUnit: 'lb' },
    ]);

    uuidSpy.mockRestore();
  });

  it('adds and replaces workout exercises while preserving order', () => {
    const base: WorkoutExercise[] = [
      { exerciseId: EXERCISE_A.id, order: 0, sets: SAMPLE_WORKOUT_EXERCISE.sets },
    ];

    const added = addOrReplaceWorkoutExercise(
      base,
      EXERCISE_B,
      [{ id: 'set-x', weight: 0, reps: 0, weightUnit: 'kg' }],
      null
    );
    expect(added.map((item) => [item.exerciseId, item.order])).toEqual([
      [EXERCISE_A.id, 0],
      [EXERCISE_B.id, 1],
    ]);

    const replaced = addOrReplaceWorkoutExercise(
      added,
      EXERCISE_B,
      [{ id: 'set-y', weight: 12, reps: 10, weightUnit: 'kg' }],
      0
    );
    expect(replaced[0]).toMatchObject({ exerciseId: EXERCISE_B.id, order: 0 });
    expect(replaced[1]).toMatchObject({ exerciseId: EXERCISE_B.id, order: 1 });
  });

  it('supports remove, move, replace and reorder operations', () => {
    const list: WorkoutExercise[] = [
      { exerciseId: 'a', order: 0, sets: [] },
      { exerciseId: 'b', order: 99, sets: [] },
      { exerciseId: 'c', order: 2, sets: [] },
    ];

    expect(reorderWorkoutExercises(list).map((value) => value.order)).toEqual([0, 1, 2]);

    expect(removeWorkoutExerciseAtIndex(list, 1).map((item) => item.exerciseId)).toEqual(['a', 'c']);

    expect(moveWorkoutExercise(list, 0, 'up')).toEqual(list);
    expect(moveWorkoutExercise(list, 2, 'down')).toEqual(list);
    expect(moveWorkoutExercise(list, 0, 'down').map((item) => item.exerciseId)).toEqual(['b', 'a', 'c']);

    expect(
      replaceWorkoutExerciseAtIndex(list, 1, {
        exerciseId: 'replacement',
        order: 1,
        sets: [{ id: 'set', reps: 1, weight: 1, weightUnit: 'kg' }],
      })[1]?.exerciseId
    ).toBe('replacement');
  });
});
