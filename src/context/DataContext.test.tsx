import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { DataProvider } from './DataContext';
import { useData } from './useData';

import { STORAGE_KEYS } from '@/lib/storage';
import type { Workout } from '@/types';


const wrapper = ({ children }: { children: React.ReactNode }) => (
  <DataProvider>{children}</DataProvider>
);

describe('DataContext', () => {
  it('requires provider usage for useData', () => {
    expect(() => renderHook(() => useData())).toThrow('useData must be used within a DataProvider');
  });

  it('hydrates from storage and computes derived workout lists', () => {
    localStorage.setItem(
      STORAGE_KEYS.EXERCISES,
      JSON.stringify([
        {
          id: 'exercise-1',
          name: 'Bench',
          muscleGroups: ['Chest'],
          isCustom: false,
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      ])
    );

    const workouts: Workout[] = [
      {
        id: 'w-completed',
        name: 'Completed',
        date: '2026-02-01',
        isCompleted: true,
        completedAt: '2026-02-01T00:00:00.000Z',
        createdAt: '2026-02-01T00:00:00.000Z',
        updatedAt: '2026-02-01T00:00:00.000Z',
        exercises: [{ exerciseId: 'exercise-1', order: 0, sets: [] }],
      },
      {
        id: 'w-upcoming',
        name: 'Upcoming',
        date: '2099-02-05',
        isCompleted: false,
        createdAt: '2026-02-01T00:00:00.000Z',
        updatedAt: '2026-02-01T00:00:00.000Z',
        exercises: [{ exerciseId: 'exercise-1', order: 0, sets: [] }],
      },
    ];
    localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(workouts));

    const { result } = renderHook(() => useData(), { wrapper });

    expect(result.current.exercises).toHaveLength(1);
    expect(result.current.completedWorkouts.map((item) => item.id)).toEqual(['w-completed']);
    expect(result.current.upcomingWorkouts.map((item) => item.id)).toEqual(['w-upcoming']);
    expect(result.current.nextWorkout?.id).toBe('w-upcoming');
  });

  it('supports CRUD operations and deletion guard rules', () => {
    const { result } = renderHook(() => useData(), { wrapper });

    let exerciseId = '';
    act(() => {
      const exercise = result.current.addExercise({
        name: 'Custom Curl',
        muscleGroups: ['Biceps'],
        comments: 'test',
        isCustom: true,
      });
      exerciseId = exercise.id;
    });

    expect(result.current.getExerciseById(exerciseId)?.name).toBe('Custom Curl');

    act(() => {
      result.current.updateExercise(exerciseId, { name: 'Custom Curl Updated' });
    });
    expect(result.current.getExerciseById(exerciseId)?.name).toBe('Custom Curl Updated');

    let workoutId = '';
    act(() => {
      const workout = result.current.addWorkout({
        name: 'Workout 1',
        date: '2026-03-03',
        isCompleted: false,
        exercises: [
          {
            exerciseId,
            order: 0,
            sets: [{ id: 'set-1', reps: 10, weight: 20, weightUnit: 'kg' }],
          },
        ],
      });
      workoutId = workout.id;
    });

    expect(() => {
      act(() => {
        result.current.deleteExercise(exerciseId);
      });
    }).toThrow('Cannot delete exercise that is used in workouts');

    act(() => {
      result.current.updateWorkout(workoutId, { isCompleted: true });
      result.current.toggleWorkoutComplete(workoutId);
      result.current.deleteWorkout(workoutId);
    });

    act(() => {
      result.current.deleteExercise(exerciseId);
    });

    expect(result.current.getExerciseById(exerciseId)).toBeUndefined();
    expect(result.current.getWorkoutById(workoutId)).toBeUndefined();
  });

  it('resets to seeded state and clears stored values', () => {
    const { result } = renderHook(() => useData(), { wrapper });

    act(() => {
      result.current.resetAllData();
    });

    expect(result.current.workouts).toEqual([]);
    expect(result.current.settings).toEqual({ defaultWeightUnit: 'kg' });
    expect(result.current.exercises.length).toBeGreaterThan(0);
    expect(localStorage.getItem(STORAGE_KEYS.WORKOUTS)).toBe('[]');
  });

  it('handles workout duplication, completion toggles, and settings updates', () => {
    const { result } = renderHook(() => useData(), { wrapper });

    let exerciseId = '';
    let workoutId = '';
    act(() => {
      exerciseId = result.current.addExercise({
        name: 'Duplicate source exercise',
        muscleGroups: ['Core'],
        isCustom: true,
      }).id;

      workoutId = result.current.addWorkout({
        name: 'Template Workout',
        date: '2026-01-01',
        exercises: [{ exerciseId, order: 0, sets: [] }],
        isCompleted: false,
      }).id;
    });

    expect(result.current.duplicateWorkout('missing-id')).toBeNull();

    let duplicatedId = '';
    act(() => {
      const duplicated = result.current.duplicateWorkout(workoutId);
      duplicatedId = duplicated?.id ?? '';
    });

    expect(duplicatedId).not.toBe('');
    expect(result.current.getWorkoutById(duplicatedId)?.name).toContain('(Copy)');

    act(() => {
      result.current.toggleWorkoutComplete(workoutId);
    });
    expect(result.current.getWorkoutById(workoutId)?.isCompleted).toBe(true);
    expect(result.current.getWorkoutById(workoutId)?.completedAt).toBeDefined();

    act(() => {
      result.current.toggleWorkoutComplete(workoutId);
      result.current.updateSettings({ defaultWeightUnit: 'lb' });
    });

    expect(result.current.getWorkoutById(workoutId)?.isCompleted).toBe(false);
    expect(result.current.settings.defaultWeightUnit).toBe('lb');
  });
});
