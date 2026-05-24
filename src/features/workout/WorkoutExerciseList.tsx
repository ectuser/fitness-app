import type { ReactNode } from 'react';
import type { Exercise, WorkoutExercise } from '@/types';
import { WorkoutExerciseCard } from './WorkoutExerciseCard';

interface WorkoutExerciseListProps {
  emptyState: ReactNode;
  exercises: Exercise[];
  onChangeExercise: (index: number, updatedExercise: WorkoutExercise) => void;
  onEditExercise?: (exercise: Exercise) => void;
  onMoveExerciseDown: (index: number) => void;
  onMoveExerciseUp: (index: number) => void;
  onRemoveExercise: (index: number) => void;
  onReplaceExercise: (index: number) => void;
  workoutExercises: WorkoutExercise[];
}

export function WorkoutExerciseList({
  emptyState,
  exercises,
  onChangeExercise,
  onEditExercise,
  onMoveExerciseDown,
  onMoveExerciseUp,
  onRemoveExercise,
  onReplaceExercise,
  workoutExercises,
}: WorkoutExerciseListProps) {
  if (workoutExercises.length === 0) {
    return emptyState;
  }

  return (
    <div className="space-y-4">
      {workoutExercises.map((workoutExercise, index) => {
        const exercise = exercises.find((entry) => entry.id === workoutExercise.exerciseId);

        if (!exercise) {
          return null;
        }

        return (
          <WorkoutExerciseCard
            key={`${workoutExercise.exerciseId}-${index}`}
            workoutExercise={workoutExercise}
            exercise={exercise}
            index={index}
            totalCount={workoutExercises.length}
            onChange={(updatedExercise) => onChangeExercise(index, updatedExercise)}
            onEditExercise={onEditExercise}
            onRemove={() => onRemoveExercise(index)}
            onMoveUp={() => onMoveExerciseUp(index)}
            onMoveDown={() => onMoveExerciseDown(index)}
            onReplace={() => onReplaceExercise(index)}
          />
        );
      })}
    </div>
  );
}
