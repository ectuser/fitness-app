import { useCallback } from 'react';
import { buildWorkoutCreateDraft, parseWorkoutCreateDraft } from '@/lib/workout-create-draft';
import { removeFromStorage, saveToStorage, STORAGE_KEYS } from '@/lib/storage';
import type { Workout } from '@/types';

type PersistDraftInput = {
  name: string;
  date: string;
  workoutExercises: Workout['exercises'];
};

export function useWorkoutCreateDraft() {
  const restoreDraft = useCallback(() => {
    let rawDraft: string | null = null;

    try {
      const storage = localStorage;
      if (typeof storage === 'undefined') {
        return null;
      }
      rawDraft = storage.getItem(STORAGE_KEYS.WORKOUT_CREATE_DRAFT);
    } catch {
      return null;
    }

    const parsedDraft = parseWorkoutCreateDraft(rawDraft);

    if (parsedDraft.status !== 'valid') {
      removeFromStorage(STORAGE_KEYS.WORKOUT_CREATE_DRAFT);
      return null;
    }

    return parsedDraft.value;
  }, []);

  const persistDraft = useCallback(({ name, date, workoutExercises }: PersistDraftInput) => {
    const draft = buildWorkoutCreateDraft({
      name,
      date,
      exercises: workoutExercises,
    });

    saveToStorage(STORAGE_KEYS.WORKOUT_CREATE_DRAFT, draft);
  }, []);

  const clearDraft = useCallback(() => {
    removeFromStorage(STORAGE_KEYS.WORKOUT_CREATE_DRAFT);
  }, []);

  return {
    restoreDraft,
    persistDraft,
    clearDraft,
  };
}
