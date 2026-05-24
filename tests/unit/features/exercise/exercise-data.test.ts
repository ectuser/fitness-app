import { describe, expect, it, beforeEach, vi } from 'vitest';
import {
  createExercise,
  deleteExercise,
  listExercises,
  updateExercise,
} from '@/features/exercise/exercise-source';
import {
  exerciseQueries,
  exerciseQueryKeys,
} from '@/features/exercise/exercise-queries';
import { STORAGE_KEYS } from '@/lib/storage';
import { completedRowWorkout, exercises } from '../../fixtures';

describe('exercise data feature', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('reads exercises asynchronously and persists migrated muscle groups', async () => {
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

    const exerciseRequest = listExercises();

    expect(exerciseRequest).toBeInstanceOf(Promise);
    await expect(exerciseRequest).resolves.toMatchObject([
      {
        id: 'legacy-arms',
        muscleGroups: ['Arms (Legacy)'],
      },
    ]);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.EXERCISES) ?? '[]')[0].muscleGroups).toEqual([
      'Arms (Legacy)',
    ]);
  });

  it('creates exercises asynchronously and returns the created exercise', async () => {
    localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(exercises));
    vi.spyOn(globalThis.crypto, 'randomUUID').mockReturnValue('77777777-7777-7777-7777-777777777777');
    vi.setSystemTime(new Date('2026-04-26T08:00:00.000Z'));

    const createdExercise = await createExercise({
      name: 'Pull-up',
      muscleGroups: ['Back'],
      isCustom: true,
    });

    expect(createdExercise).toEqual({
      id: '77777777-7777-7777-7777-777777777777',
      createdAt: '2026-04-26T08:00:00.000Z',
      name: 'Pull-up',
      muscleGroups: ['Back'],
      isCustom: true,
    });
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.EXERCISES) ?? '[]').at(-1)).toEqual(
      createdExercise
    );
  });

  it('updates exercises asynchronously and returns the updated exercise', async () => {
    localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(exercises));

    const updatedExercise = await updateExercise({
      id: 'exercise-row',
      updates: { name: 'Chest Supported Row' },
    });

    expect(updatedExercise.name).toBe('Chest Supported Row');
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.EXERCISES) ?? '[]')[1].name).toBe(
      'Chest Supported Row'
    );
  });

  it('deletes unused exercises and rejects exercises already used by workouts', async () => {
    localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(exercises));
    localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify([]));

    await expect(deleteExercise({ id: 'exercise-row' })).resolves.toBeUndefined();
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.EXERCISES) ?? '[]')).toHaveLength(2);

    localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(exercises));
    localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify([completedRowWorkout]));

    await expect(deleteExercise({ id: 'exercise-row' })).rejects.toThrow(
      'Cannot delete exercise that is used in workouts'
    );
  });

  it('defines a feature-owned exercise list query through the shared query factory', async () => {
    localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(exercises));

    const query = exerciseQueries.list();
    const queryFn = query.queryFn as () => Promise<typeof exercises>;

    expect(query.queryKey).toEqual(exerciseQueryKeys.list());
    await expect(queryFn()).resolves.toEqual(exercises);
  });
});
