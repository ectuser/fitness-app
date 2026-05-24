import { QueryClient } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createWorkout,
  duplicateWorkout,
  listWorkouts,
  toggleWorkoutComplete,
  updateWorkout,
} from '@/features/workout/workout-source';
import {
  workoutQueries,
  workoutQueryKeys,
} from '@/features/workout/workout-queries';
import { workoutMutations } from '@/features/workout/workout-mutations';
import { STORAGE_KEYS } from '@/lib/storage';
import { clone, completedBenchWorkout, upcomingWorkout } from '../../fixtures';

describe('workout data feature', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('reads workouts asynchronously through a feature-owned query', async () => {
    localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify([completedBenchWorkout]));

    const workoutsRequest = listWorkouts();

    expect(workoutsRequest).toBeInstanceOf(Promise);
    await expect(workoutsRequest).resolves.toEqual([completedBenchWorkout]);

    const query = workoutQueries.list();
    const queryFn = query.queryFn as () => Promise<typeof completedBenchWorkout[]>;

    expect(query.queryKey).toEqual(workoutQueryKeys.list());
    await expect(queryFn()).resolves.toEqual([completedBenchWorkout]);
  });

  it('creates, updates, duplicates, and toggles workouts asynchronously with changed resources', async () => {
    localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify([upcomingWorkout]));
    vi.spyOn(globalThis.crypto, 'randomUUID')
      .mockReturnValueOnce('88888888-8888-8888-8888-888888888888')
      .mockReturnValueOnce('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')
      .mockReturnValueOnce('99999999-9999-9999-9999-999999999999');
    vi.setSystemTime(new Date('2026-04-26T09:00:00.000Z'));

    const createdWorkout = await createWorkout({
      name: 'Finished Workout',
      date: '2026-04-26',
      exercises: [],
      isCompleted: true,
      completedAt: '2026-04-26T09:30:00.000Z',
    });

    expect(createdWorkout).toMatchObject({
      id: '88888888-8888-8888-8888-888888888888',
      name: 'Finished Workout',
    });

    const updatedWorkout = await updateWorkout({
      id: upcomingWorkout.id,
      updates: { name: 'Updated Leg Day' },
    });

    expect(updatedWorkout).toMatchObject({
      id: upcomingWorkout.id,
      name: 'Updated Leg Day',
    });

    const duplicatedWorkout = await duplicateWorkout({
      id: upcomingWorkout.id,
      options: { date: '2026-04-27' },
    });

    expect(duplicatedWorkout).toMatchObject({
      id: '99999999-9999-9999-9999-999999999999',
      name: 'Updated Leg Day (Copy)',
      date: '2026-04-27',
      isCompleted: false,
    });

    const toggledWorkout = await toggleWorkoutComplete({ id: upcomingWorkout.id });

    expect(toggledWorkout).toMatchObject({
      id: upcomingWorkout.id,
      isCompleted: true,
      completedAt: '2026-04-26T09:00:00.000Z',
    });
  });

  it('refreshes workout query data after mutations', async () => {
    localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify([clone(upcomingWorkout)]));
    const queryClient = new QueryClient();
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');

    await workoutMutations.update(queryClient).mutationFn({
      id: upcomingWorkout.id,
      updates: { name: 'Updated Leg Day' },
    });
    await workoutMutations.update(queryClient).onSuccess();

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: workoutQueryKeys.list(),
    });
  });
});
