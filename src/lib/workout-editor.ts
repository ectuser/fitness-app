import { findLastWorkoutExercise } from '../features/training-history/training-history-projections';
import type { Exercise, MuscleGroup, WeightUnit, Workout, WorkoutExercise } from '@/types';

export function formatDefaultWorkoutName(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
  });
}

function normalizeWorkoutExercises(exercises: WorkoutExercise[]) {
  return exercises.map((exercise, index) => ({
    ...exercise,
    order: index,
  }));
}

function buildDefaultSets(
  exercise: Exercise,
  workouts: Workout[],
  defaultWeightUnit: WeightUnit,
  createId = () => crypto.randomUUID()
) {
  const lastWorkoutExercise = findLastWorkoutExercise(exercise.id, workouts);

  if (lastWorkoutExercise) {
    return {
      sets: lastWorkoutExercise.sets.map((set) => ({
        id: createId(),
        weight: set.weight,
        weightUnit: set.weightUnit,
        reps: set.reps,
      })),
      comment: lastWorkoutExercise.comment ?? exercise.comments ?? '',
    };
  }

  return {
    sets: [
      {
        id: createId(),
        weight: 0,
        weightUnit: defaultWeightUnit,
        reps: 0,
      },
    ],
    comment: exercise.comments ?? '',
  };
}

export function createWorkoutExerciseFromExercise(
  exercise: Exercise,
  workouts: Workout[],
  defaultWeightUnit: WeightUnit,
  order: number,
  createId = () => crypto.randomUUID()
): WorkoutExercise {
  const defaults = buildDefaultSets(exercise, workouts, defaultWeightUnit, createId);

  return {
    exerciseId: exercise.id,
    sets: defaults.sets,
    order,
    comment: defaults.comment,
  };
}

export function addOrReplaceWorkoutExercise(
  workoutExercises: WorkoutExercise[],
  exercise: Exercise,
  workouts: Workout[],
  defaultWeightUnit: WeightUnit,
  replacingExerciseIndex: number | null
): WorkoutExercise[] {
  const nextExercise = createWorkoutExerciseFromExercise(
    exercise,
    workouts,
    defaultWeightUnit,
    replacingExerciseIndex ?? workoutExercises.length
  );

  if (replacingExerciseIndex === null) {
    return [...workoutExercises, nextExercise];
  }

  return workoutExercises.map((workoutExercise, index) =>
    index === replacingExerciseIndex ? nextExercise : workoutExercise
  );
}

export function removeWorkoutExerciseAtIndex(workoutExercises: WorkoutExercise[], index: number) {
  return normalizeWorkoutExercises(workoutExercises.filter((_, currentIndex) => currentIndex !== index));
}

export function moveWorkoutExercise(
  workoutExercises: WorkoutExercise[],
  index: number,
  direction: 'up' | 'down'
) {
  const nextIndex = direction === 'up' ? index - 1 : index + 1;

  if (nextIndex < 0 || nextIndex >= workoutExercises.length) {
    return workoutExercises;
  }

  const updatedExercises = [...workoutExercises];
  [updatedExercises[index], updatedExercises[nextIndex]] = [
    updatedExercises[nextIndex],
    updatedExercises[index],
  ];

  return normalizeWorkoutExercises(updatedExercises);
}

export function updateWorkoutExerciseAtIndex(
  workoutExercises: WorkoutExercise[],
  index: number,
  updatedExercise: WorkoutExercise
) {
  return workoutExercises.map((workoutExercise, currentIndex) =>
    currentIndex === index ? updatedExercise : workoutExercise
  );
}

export function getExerciseReplacementFilterGroup(
  workoutExercises: WorkoutExercise[],
  exercises: Exercise[],
  index: number
): MuscleGroup | null {
  const currentExerciseId = workoutExercises[index]?.exerciseId;
  const currentExercise = exercises.find((exercise) => exercise.id === currentExerciseId);
  return currentExercise?.muscleGroups[0] ?? null;
}

export function validateWorkoutForm(name: string, workoutExercises: WorkoutExercise[]) {
  const errors: { exercises?: string; name?: string } = {};

  if (!name.trim()) {
    errors.name = 'Workout name is required';
  }

  if (workoutExercises.length === 0) {
    errors.exercises = 'Add at least one exercise';
  }

  return errors;
}
