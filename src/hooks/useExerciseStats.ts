import { useMemo } from 'react';
import type { Workout, ExerciseStats, WorkoutHistory } from '@/types';

/**
 * Hook to calculate exercise statistics from completed workouts
 * @param exerciseId - ID of the exercise to get stats for
 * @param workouts - All workouts
 * @returns ExerciseStats object with max weight, total sets, etc.
 */
export function useExerciseStats(
  exerciseId: string,
  workouts: Workout[]
): ExerciseStats | null {
  return useMemo(() => {
    // Only consider completed workouts
    const completedWorkouts = workouts.filter((w) => w.isCompleted);

    // Find all instances of this exercise in completed workouts
    const exerciseSets: { weight: number; reps: number; unit: string }[] = [];

    completedWorkouts.forEach((workout) => {
      workout.exercises.forEach((workoutExercise) => {
        if (workoutExercise.exerciseId === exerciseId) {
          workoutExercise.sets.forEach((set) => {
            exerciseSets.push({
              weight: set.weight,
              reps: set.reps,
              unit: set.weightUnit,
            });
          });
        }
      });
    });

    // If no sets found, return null
    if (exerciseSets.length === 0) {
      return null;
    }

    // Find max weight (considering only kg for now, or convert if needed)
    let maxWeight = 0;
    let maxWeightReps = 0;
    let maxWeightUnit: 'kg' | 'lb' = 'kg';

    exerciseSets.forEach((set) => {
      if (set.weight > maxWeight) {
        maxWeight = set.weight;
        maxWeightReps = set.reps;
        maxWeightUnit = set.unit as 'kg' | 'lb';
      }
    });

    // Find last performed date
    let lastPerformed: string | undefined;
    completedWorkouts.forEach((workout) => {
      const hasExercise = workout.exercises.some(
        (we) => we.exerciseId === exerciseId
      );
      if (hasExercise) {
        if (!lastPerformed || workout.date > lastPerformed) {
          lastPerformed = workout.date;
        }
      }
    });

    return {
      exerciseId,
      maxWeight,
      maxWeightReps,
      maxWeightUnit,
      totalSets: exerciseSets.length,
      lastPerformed,
    };
  }, [exerciseId, workouts]);
}

/**
 * Hook to get workout history for a specific exercise
 * @param exerciseId - ID of the exercise
 * @param workouts - All workouts
 * @returns Array of WorkoutHistory objects
 */
export function useExerciseHistory(
  exerciseId: string,
  workouts: Workout[]
): WorkoutHistory[] {
  return useMemo(() => {
    // Only consider completed workouts
    const completedWorkouts = workouts.filter((w) => w.isCompleted);

    const history: WorkoutHistory[] = [];

    completedWorkouts.forEach((workout) => {
      workout.exercises.forEach((workoutExercise) => {
        if (workoutExercise.exerciseId === exerciseId) {
          history.push({
            workoutId: workout.id,
            workoutName: workout.name,
            date: workout.date,
            setData: workoutExercise.sets,
          });
        }
      });
    });

    // Sort by date descending (most recent first)
    return history.sort((a, b) => b.date.localeCompare(a.date));
  }, [exerciseId, workouts]);
}
