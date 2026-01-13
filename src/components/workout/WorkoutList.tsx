import { WorkoutCard } from './WorkoutCard';
import type { Workout, Exercise } from '@/types';

interface WorkoutListProps {
  workouts: Workout[];
  exercises: Exercise[];
  onStart: (workoutId: string) => void;
  onEdit: (workoutId: string) => void;
  onDuplicate: (workoutId: string) => void;
  onDelete: (workoutId: string) => void;
  onToggleComplete: (workoutId: string) => void;
}

export function WorkoutList({
  workouts,
  exercises,
  onStart,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleComplete,
}: WorkoutListProps) {
  if (workouts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {workouts.map((workout) => (
        <WorkoutCard
          key={workout.id}
          workout={workout}
          exercises={exercises}
          onStart={() => onStart(workout.id)}
          onEdit={() => onEdit(workout.id)}
          onDuplicate={() => onDuplicate(workout.id)}
          onDelete={() => onDelete(workout.id)}
          onToggleComplete={() => onToggleComplete(workout.id)}
        />
      ))}
    </div>
  );
}
