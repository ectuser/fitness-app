import { describe, expect, it } from 'vitest';
import { buildExerciseHistory, calculateExerciseStats, findLastWorkoutExercise } from '@/lib/exercise-stats';
import { completedBenchWorkout, completedRowWorkout, upcomingWorkout } from '../fixtures';

describe('exercise stats helpers', () => {
  it('calculates stats from completed workouts only', () => {
    const stats = calculateExerciseStats('exercise-bench', [
      completedBenchWorkout,
      completedRowWorkout,
      upcomingWorkout,
    ]);

    expect(stats).toEqual({
      exerciseId: 'exercise-bench',
      maxWeight: 105,
      maxWeightReps: 3,
      maxWeightUnit: 'kg',
      lastWeight: 105,
      lastWeightReps: 3,
      lastWeightUnit: 'kg',
      totalSets: 3,
      lastPerformed: '2026-04-22',
    });
  });

  it('returns null when no completed sets exist', () => {
    expect(calculateExerciseStats('exercise-plank', [upcomingWorkout])).toBeNull();
  });

  it('builds descending history and returns the latest workout exercise', () => {
    expect(buildExerciseHistory('exercise-bench', [completedBenchWorkout, completedRowWorkout])).toEqual([
      {
        workoutId: 'workout-completed-2',
        workoutName: 'Pull Day',
        date: '2026-04-22',
        setData: completedRowWorkout.exercises[1].sets,
      },
      {
        workoutId: 'workout-completed-1',
        workoutName: 'Push Day',
        date: '2026-04-20',
        setData: completedBenchWorkout.exercises[0].sets,
      },
    ]);

    expect(findLastWorkoutExercise('exercise-row', [completedBenchWorkout, completedRowWorkout])).toEqual(
      completedRowWorkout.exercises[0]
    );
  });
});
