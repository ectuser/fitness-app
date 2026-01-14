import { useMemo } from 'react';
import type { Workout, ExerciseStats, WorkoutHistory, WorkoutExercise } from '@/types';

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

    // Find last performed date and last weight/reps
    let lastPerformed: string | undefined;
    let lastWeight: number | undefined;
    let lastWeightReps: number | undefined;
    let lastWeightUnit: 'kg' | 'lb' | undefined;

    // Sort completed workouts by date to find the most recent
    const sortedWorkouts = [...completedWorkouts].sort((a, b) =>
      b.date.localeCompare(a.date)
    );

    // Find the most recent workout with this exercise
    for (const workout of sortedWorkouts) {
      const workoutExercise = workout.exercises.find(
        (we) => we.exerciseId === exerciseId
      );
      if (workoutExercise && workoutExercise.sets.length > 0) {
        lastPerformed = workout.date;
        // Get the first set's weight and reps from the last workout
        const firstSet = workoutExercise.sets[0];
        lastWeight = firstSet.weight;
        lastWeightReps = firstSet.reps;
        lastWeightUnit = firstSet.weightUnit as 'kg' | 'lb';
        break;
      }
    }

    return {
      exerciseId,
      maxWeight,
      maxWeightReps,
      maxWeightUnit,
      lastWeight,
      lastWeightReps,
      lastWeightUnit,
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

/**
 * Hook to get the last workout data for a specific exercise
 * @param exerciseId - ID of the exercise
 * @param workouts - All workouts
 * @returns WorkoutExercise from the most recent completed workout, or null if not found
 */
export function useLastWorkoutExercise(
  exerciseId: string,
  workouts: Workout[]
): WorkoutExercise | null {
  return useMemo(() => {
    // Only consider completed workouts
    const completedWorkouts = workouts.filter((w) => w.isCompleted);

    // Sort by date descending (most recent first)
    const sortedWorkouts = [...completedWorkouts].sort((a, b) =>
      b.date.localeCompare(a.date)
    );

    // Find the most recent workout with this exercise
    for (const workout of sortedWorkouts) {
      const workoutExercise = workout.exercises.find(
        (we) => we.exerciseId === exerciseId
      );
      if (workoutExercise) {
        return workoutExercise;
      }
    }

    return null;
  }, [exerciseId, workouts]);
}
