import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Play } from 'lucide-react';
import type { Workout, Exercise } from '@/types';
import { WorkoutMenu } from './WorkoutMenu';

interface WorkoutCardProps {
  workout: Workout;
  exercises: Exercise[];
  onStart: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onToggleComplete: () => void;
}

export function WorkoutCard({
  workout,
  exercises,
  onStart,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleComplete,
}: WorkoutCardProps) {
  const workoutExercises = workout.exercises
    .map((we) => exercises.find((e) => e.id === we.exerciseId))
    .filter((e): e is Exercise => e !== undefined);

  const muscleGroups = Array.from(
    new Set(workoutExercises.flatMap((e) => e.muscleGroups))
  );

  const totalSets = workout.exercises.reduce(
    (sum, we) => sum + we.sets.length,
    0
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.getTime() === today.getTime()) {
      return 'Today';
    } else if (date.getTime() === tomorrow.getTime()) {
      return 'Tomorrow';
    } else if (date.getTime() === yesterday.getTime()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-lg">{workout.name}</h3>
            {workout.isCompleted && (
              <Badge variant="secondary" className="text-xs">
                Completed
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1 text-sm text-slate-600">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(workout.date)}</span>
          </div>
        </div>

        <WorkoutMenu
          workout={workout}
          onEdit={onEdit}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
          onToggleComplete={onToggleComplete}
        />
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap gap-1">
          {muscleGroups.map((muscle) => (
            <Badge key={muscle} variant="outline" className="text-xs">
              {muscle}
            </Badge>
          ))}
        </div>

        <div className="text-sm text-slate-600">
          {workoutExercises.length} exercise{workoutExercises.length !== 1 ? 's' : ''}{' '}
          • {totalSets} set{totalSets !== 1 ? 's' : ''}
        </div>

        {!workout.isCompleted && (
          <Button onClick={onStart} className="w-full">
            <Play className="w-4 h-4 mr-2" />
            Start Workout
          </Button>
        )}
      </div>
    </Card>
  );
}
