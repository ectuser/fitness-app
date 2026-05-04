import type { WorkoutExercise } from '@/types';

const WORKOUT_FORM_DRAFT_PREFIX = 'fitness-app-workout-form-draft:';

export interface WorkoutFormDraft {
  name: string;
  date: string;
  workoutExercises: WorkoutExercise[];
}

function getDraftStorageKey(pathname: string): string {
  return `${WORKOUT_FORM_DRAFT_PREFIX}${pathname}`;
}

export function saveWorkoutFormDraft(pathname: string, draft: WorkoutFormDraft): void {
  if (typeof sessionStorage === 'undefined') {
    return;
  }

  try {
    sessionStorage.setItem(getDraftStorageKey(pathname), JSON.stringify(draft));
  } catch (error) {
    console.error('Failed to save workout form draft:', error);
  }
}

export function consumeWorkoutFormDraft(pathname: string): WorkoutFormDraft | null {
  if (typeof sessionStorage === 'undefined') {
    return null;
  }

  const storageKey = getDraftStorageKey(pathname);

  try {
    const rawDraft = sessionStorage.getItem(storageKey);
    if (!rawDraft) {
      return null;
    }

    sessionStorage.removeItem(storageKey);
    const parsedDraft = JSON.parse(rawDraft) as Partial<WorkoutFormDraft>;

    if (
      typeof parsedDraft.name !== 'string' ||
      typeof parsedDraft.date !== 'string' ||
      !Array.isArray(parsedDraft.workoutExercises)
    ) {
      return null;
    }

    return {
      name: parsedDraft.name,
      date: parsedDraft.date,
      workoutExercises: parsedDraft.workoutExercises,
    };
  } catch (error) {
    console.error('Failed to read workout form draft:', error);
    return null;
  }
}
