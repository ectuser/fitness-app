import type { Exercise, Set, WeightUnit, Workout, WorkoutExercise } from '@/types';

export function reorderWorkoutExercises(workoutExercises: WorkoutExercise[]): WorkoutExercise[] {
  return workoutExercises.map((exercise, index) => ({
    ...exercise,
    order: index,
  }));
}

export function findLastCompletedWorkoutExercise(
  workouts: Workout[],
  exerciseId: string
): WorkoutExercise | null {
  const sortedCompletedWorkouts = workouts
    .filter((workout) => workout.isCompleted)
    .sort((a, b) => b.date.localeCompare(a.date));

  for (const workout of sortedCompletedWorkouts) {
    const exercise = workout.exercises.find((workoutExercise) => workoutExercise.exerciseId === exerciseId);
    if (exercise) {
      return exercise;
    }
  }

  return null;
}

export function createDefaultSets(
  lastWorkoutExercise: WorkoutExercise | null,
  defaultWeightUnit: WeightUnit
): Set[] {
  if (!lastWorkoutExercise) {
    return [
      {
        id: crypto.randomUUID(),
        reps: 0,
        weight: 0,
        weightUnit: defaultWeightUnit,
      },
    ];
  }

  return lastWorkoutExercise.sets.map((set) => ({
    id: crypto.randomUUID(),
    reps: set.reps,
    weight: set.weight,
    weightUnit: set.weightUnit,
  }));
}

export function addOrReplaceWorkoutExercise(
  workoutExercises: WorkoutExercise[],
  exercise: Exercise,
  defaultSets: Set[],
  replacingExerciseIndex: number | null
): WorkoutExercise[] {
  if (replacingExerciseIndex !== null) {
    return reorderWorkoutExercises(
      workoutExercises.map((workoutExercise, index) =>
        index === replacingExerciseIndex
          ? {
              exerciseId: exercise.id,
              order: index,
              sets: defaultSets,
            }
          : workoutExercise
      )
    );
  }

  return reorderWorkoutExercises([
    ...workoutExercises,
    {
      exerciseId: exercise.id,
      sets: defaultSets,
      order: workoutExercises.length,
    },
  ]);
}

export function removeWorkoutExerciseAtIndex(
  workoutExercises: WorkoutExercise[],
  indexToRemove: number
): WorkoutExercise[] {
  return reorderWorkoutExercises(workoutExercises.filter((_, index) => index !== indexToRemove));
}

export function moveWorkoutExercise(
  workoutExercises: WorkoutExercise[],
  index: number,
  direction: 'up' | 'down'
): WorkoutExercise[] {
  const targetIndex = direction === 'up' ? index - 1 : index + 1;

  if (targetIndex < 0 || targetIndex >= workoutExercises.length) {
    return workoutExercises;
  }

  const updated = [...workoutExercises];
  [updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]];

  return reorderWorkoutExercises(updated);
}

export function replaceWorkoutExerciseAtIndex(
  workoutExercises: WorkoutExercise[],
  index: number,
  updatedExercise: WorkoutExercise
): WorkoutExercise[] {
  return workoutExercises.map((workoutExercise, exerciseIndex) =>
    exerciseIndex === index ? updatedExercise : workoutExercise
  );
}
