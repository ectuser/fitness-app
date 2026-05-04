import { describe, expect, it } from 'vitest';
import { getReturnToWorkoutPathFromSearch } from '@/lib/exercise-return-path';

describe('exercise return path', () => {
  it('allows /workouts/new as a return target', () => {
    expect(getReturnToWorkoutPathFromSearch('?returnTo=%2Fworkouts%2Fnew')).toBe('/workouts/new');
  });

  it('allows /workouts/:id/edit as a return target', () => {
    expect(getReturnToWorkoutPathFromSearch('?returnTo=%2Fworkouts%2Fabc-123%2Fedit')).toBe(
      '/workouts/abc-123/edit'
    );
  });

  it('rejects missing and unrelated return targets', () => {
    expect(getReturnToWorkoutPathFromSearch('')).toBeNull();
    expect(getReturnToWorkoutPathFromSearch('?returnTo=%2Fexercises')).toBeNull();
    expect(getReturnToWorkoutPathFromSearch('?returnTo=%2Fworkouts%2Fabc-123%2Fsession')).toBeNull();
  });
});
