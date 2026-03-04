import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useExerciseHistory, useExerciseStats, useLastWorkoutExercise } from './useExerciseStats';

import type { Workout } from '@/types';


const workouts: Workout[] = [
  {
    id: 'w-1',
    name: 'Push',
    date: '2026-02-01',
    isCompleted: true,
    completedAt: '2026-02-01T10:00:00.000Z',
    createdAt: '2026-02-01T00:00:00.000Z',
    updatedAt: '2026-02-01T10:00:00.000Z',
    exercises: [
      {
        exerciseId: 'bench',
        order: 0,
        sets: [
          { id: 'set-1', weight: 100, reps: 5, weightUnit: 'kg' },
          { id: 'set-2', weight: 90, reps: 8, weightUnit: 'kg' },
        ],
      },
    ],
  },
  {
    id: 'w-2',
    name: 'Push 2',
    date: '2026-02-10',
    isCompleted: true,
    completedAt: '2026-02-10T10:00:00.000Z',
    createdAt: '2026-02-10T00:00:00.000Z',
    updatedAt: '2026-02-10T10:00:00.000Z',
    exercises: [
      {
        exerciseId: 'bench',
        order: 0,
        sets: [{ id: 'set-3', weight: 105, reps: 4, weightUnit: 'kg' }],
      },
    ],
  },
  {
    id: 'w-3',
    name: 'Future Plan',
    date: '2026-03-01',
    isCompleted: false,
    createdAt: '2026-03-01T00:00:00.000Z',
    updatedAt: '2026-03-01T00:00:00.000Z',
    exercises: [
      {
        exerciseId: 'bench',
        order: 0,
        sets: [{ id: 'set-4', weight: 1, reps: 1, weightUnit: 'kg' }],
      },
    ],
  },
];

describe('useExerciseStats hooks', () => {
  it('returns null when no completed data exists', () => {
    const { result } = renderHook(() => useExerciseStats('squat', workouts));
    expect(result.current).toBeNull();
  });

  it('builds summary stats from completed workouts only', () => {
    const { result } = renderHook(() => useExerciseStats('bench', workouts));

    expect(result.current).toMatchObject({
      exerciseId: 'bench',
      maxWeight: 105,
      maxWeightReps: 4,
      maxWeightUnit: 'kg',
      lastWeight: 105,
      lastWeightReps: 4,
      lastWeightUnit: 'kg',
      totalSets: 3,
      lastPerformed: '2026-02-10',
    });
  });

  it('returns descending workout history by date', () => {
    const { result } = renderHook(() => useExerciseHistory('bench', workouts));

    expect(result.current.map((item) => item.workoutId)).toEqual(['w-2', 'w-1']);
    expect(result.current[0]?.setData).toHaveLength(1);
  });

  it('returns latest completed workout exercise for an exercise', () => {
    const { result } = renderHook(() => useLastWorkoutExercise('bench', workouts));

    expect(result.current?.sets[0]?.id).toBe('set-3');
  });

  it('skips empty recent sets when calculating last set details', () => {
    const withEmptyRecent: Workout[] = [
      ...workouts,
      {
        id: 'w-4',
        name: 'Recent no sets',
        date: '2026-02-15',
        isCompleted: true,
        completedAt: '2026-02-15T10:00:00.000Z',
        createdAt: '2026-02-15T00:00:00.000Z',
        updatedAt: '2026-02-15T10:00:00.000Z',
        exercises: [{ exerciseId: 'bench', order: 0, sets: [] }],
      },
    ];

    const { result } = renderHook(() => useExerciseStats('bench', withEmptyRecent));
    expect(result.current?.lastPerformed).toBe('2026-02-10');
    expect(result.current?.lastWeight).toBe(105);
  });
});
