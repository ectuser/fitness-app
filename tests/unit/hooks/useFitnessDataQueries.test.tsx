import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  fitnessQueryKeys,
  useExercises,
  useFitnessDataReset,
  useSettings,
  useWorkouts,
} from '@/hooks/useFitnessDataQueries';
import { STORAGE_KEYS } from '@/lib/storage';
import { DEFAULT_SETTINGS } from '@/lib/settings';
import { clone, completedBenchWorkout, exercises, upcomingWorkout } from '../fixtures';

function createWrapper(queryClient = new QueryClient()) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('fitness data query hooks', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('reads exercises, workouts, and settings from localStorage-backed queries', () => {
    localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(exercises));
    localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify([completedBenchWorkout]));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({ defaultWeightUnit: 'lb' }));

    const queryClient = new QueryClient();
    const wrapper = createWrapper(queryClient);
    const { result: exercisesResult } = renderHook(() => useExercises(), { wrapper });
    const { result: workoutsResult } = renderHook(() => useWorkouts(), { wrapper });
    const { result: settingsResult } = renderHook(() => useSettings(), { wrapper });

    expect(exercisesResult.current.exercises).toEqual(exercises);
    expect(workoutsResult.current.workouts).toEqual([completedBenchWorkout]);
    expect(settingsResult.current.settings).toEqual({ defaultWeightUnit: 'lb' });
    expect(queryClient.getQueryData(fitnessQueryKeys.exercises())).toEqual(exercises);
    expect(queryClient.getQueryData(fitnessQueryKeys.workouts())).toEqual([completedBenchWorkout]);
    expect(queryClient.getQueryData(fitnessQueryKeys.settings())).toEqual({ defaultWeightUnit: 'lb' });
  });

  it('persists migrated exercise data when reading from storage', () => {
    localStorage.setItem(
      STORAGE_KEYS.EXERCISES,
      JSON.stringify([
        {
          id: 'legacy-arms',
          name: 'Legacy Arms',
          muscleGroups: ['Arms'],
          isCustom: true,
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      ])
    );

    const { result } = renderHook(() => useExercises(), {
      wrapper: createWrapper(),
    });

    expect(result.current.exercises[0].muscleGroups).toEqual(['Arms (Legacy)']);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.EXERCISES) ?? '[]')[0].muscleGroups).toEqual([
      'Arms (Legacy)',
    ]);
  });

  it('persists exercise mutations through query data instead of component state', async () => {
    localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(exercises));
    localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify([]));
    vi.spyOn(globalThis.crypto, 'randomUUID').mockReturnValue('77777777-7777-7777-7777-777777777777');
    vi.setSystemTime(new Date('2026-04-26T08:00:00.000Z'));

    const queryClient = new QueryClient();
    const { result } = renderHook(() => useExercises(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.addExercise({
        name: 'Pull-up',
        muscleGroups: ['Back'],
        isCustom: true,
      });
    });

    const storedExercises = JSON.parse(localStorage.getItem(STORAGE_KEYS.EXERCISES) ?? '[]');
    expect(storedExercises.at(-1)).toMatchObject({
      id: '77777777-7777-7777-7777-777777777777',
      name: 'Pull-up',
    });
    expect(queryClient.getQueryData(fitnessQueryKeys.exercises())).toEqual(storedExercises);

    act(() => {
      result.current.updateExercise('77777777-7777-7777-7777-777777777777', {
        name: 'Weighted Pull-up',
      });
    });

    await waitFor(() => {
      expect(result.current.getExerciseById('77777777-7777-7777-7777-777777777777')?.name).toBe(
        'Weighted Pull-up'
      );
    });
  });

  it('persists workout mutations and exposes derived workout lists', async () => {
    const futureWorkout = { ...clone(upcomingWorkout), date: '2099-04-26' };
    localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify([futureWorkout]));
    vi.spyOn(globalThis.crypto, 'randomUUID').mockReturnValue('88888888-8888-8888-8888-888888888888');
    vi.setSystemTime(new Date('2026-04-26T09:00:00.000Z'));

    const { result } = renderHook(() => useWorkouts(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.addWorkout({
        name: 'Finished Workout',
        date: '2026-04-26',
        exercises: [],
        isCompleted: true,
        completedAt: '2026-04-26T09:30:00.000Z',
      });
    });

    await waitFor(() => {
      expect(result.current.completedWorkouts[0].id).toBe('88888888-8888-8888-8888-888888888888');
    });
    expect(result.current.nextWorkout?.id).toBe(futureWorkout.id);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.WORKOUTS) ?? '[]')).toHaveLength(2);
  });

  it('persists settings updates through a mutation and refreshes the settings query', async () => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));

    const queryClient = new QueryClient();
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useSettings(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.updateSettings({ defaultWeightUnit: 'lb' });
    });

    await waitFor(() => {
      expect(result.current.settings).toEqual({ defaultWeightUnit: 'lb' });
    });

    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) ?? 'null')).toEqual({
      defaultWeightUnit: 'lb',
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: fitnessQueryKeys.settings(),
    });
  });

  it('resets all localStorage-backed query state together', () => {
    localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(exercises));
    localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify([completedBenchWorkout]));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({ defaultWeightUnit: 'lb' }));
    localStorage.setItem(STORAGE_KEYS.WORKOUT_CREATE_DRAFT, JSON.stringify({ name: 'Draft' }));

    const queryClient = new QueryClient();
    const { result } = renderHook(() => useFitnessDataReset(), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current.resetAllData();
    });

    expect(localStorage.getItem(STORAGE_KEYS.WORKOUT_CREATE_DRAFT)).toBeNull();
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.EXERCISES) ?? '[]')).toEqual(expect.any(Array));
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.WORKOUTS) ?? 'null')).toEqual([]);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) ?? 'null')).toEqual(DEFAULT_SETTINGS);
    expect(queryClient.getQueryData(fitnessQueryKeys.workouts())).toEqual([]);
    expect(queryClient.getQueryData(fitnessQueryKeys.settings())).toEqual(DEFAULT_SETTINGS);
    expect(queryClient.getQueryData(fitnessQueryKeys.exercises())).toEqual(expect.any(Array));
  });
});
