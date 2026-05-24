import { useMemo, useState } from 'react';
import {
  addOrReplaceWorkoutExercise,
  getExerciseReplacementFilterGroup,
  moveWorkoutExercise,
  removeWorkoutExerciseAtIndex,
  updateWorkoutExerciseAtIndex,
} from './workout-editor';
import type { Exercise, MuscleGroup, WeightUnit, Workout, WorkoutExercise } from '@/types';

interface UseWorkoutExerciseEditorOptions {
  defaultWeightUnit: WeightUnit;
  exercises: Exercise[];
  initialWorkoutExercises?: WorkoutExercise[];
  workouts: Workout[];
}

export function useWorkoutExerciseEditor({
  defaultWeightUnit,
  exercises,
  initialWorkoutExercises = [],
  workouts,
}: UseWorkoutExerciseEditorOptions) {
  const [workoutExercises, setWorkoutExercises] = useState(initialWorkoutExercises);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [replacingExerciseIndex, setReplacingExerciseIndex] = useState<number | null>(null);
  const [selectorInitialFilterGroup, setSelectorInitialFilterGroup] = useState<MuscleGroup | null>(null);

  const closeSelector = () => {
    setIsSelectorOpen(false);
    setReplacingExerciseIndex(null);
    setSelectorInitialFilterGroup(null);
  };

  return {
    workoutExercises,
    setWorkoutExercises,
    selectedExerciseIds: useMemo(
      () => workoutExercises.map((workoutExercise) => workoutExercise.exerciseId),
      [workoutExercises]
    ),
    showExerciseSelector: isSelectorOpen,
    selectorInitialFilterGroup,
    openAddExerciseSelector: () => {
      setReplacingExerciseIndex(null);
      setSelectorInitialFilterGroup(null);
      setIsSelectorOpen(true);
    },
    setShowExerciseSelector: (isOpen: boolean) => {
      if (!isOpen) {
        closeSelector();
        return;
      }

      setIsSelectorOpen(true);
    },
    handleAddExercise: (exercise: Exercise) => {
      setWorkoutExercises((currentExercises) =>
        addOrReplaceWorkoutExercise(
          currentExercises,
          exercise,
          workouts,
          defaultWeightUnit,
          replacingExerciseIndex
        )
      );
      closeSelector();
    },
    handleRemoveExercise: (index: number) => {
      setWorkoutExercises((currentExercises) => removeWorkoutExerciseAtIndex(currentExercises, index));
    },
    handleMoveExerciseUp: (index: number) => {
      setWorkoutExercises((currentExercises) => moveWorkoutExercise(currentExercises, index, 'up'));
    },
    handleMoveExerciseDown: (index: number) => {
      setWorkoutExercises((currentExercises) => moveWorkoutExercise(currentExercises, index, 'down'));
    },
    handleUpdateExercise: (index: number, updatedExercise: WorkoutExercise) => {
      setWorkoutExercises((currentExercises) =>
        updateWorkoutExerciseAtIndex(currentExercises, index, updatedExercise)
      );
    },
    handleReplaceExercise: (index: number) => {
      setReplacingExerciseIndex(index);
      setSelectorInitialFilterGroup(
        getExerciseReplacementFilterGroup(workoutExercises, exercises, index)
      );
      setIsSelectorOpen(true);
    },
  };
}
