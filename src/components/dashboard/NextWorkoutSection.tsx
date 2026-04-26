import { Calendar, Play, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatWorkoutDate, getWorkoutMuscleGroups, getWorkoutTotalSets } from '@/lib/workouts';
import type { Exercise, Workout } from '@/types';

interface NextWorkoutSectionProps {
  exercises: Exercise[];
  nextWorkout: Workout | null;
  onCreateWorkout: () => void;
  onStartWorkout: (workoutId: string) => void;
}

export function NextWorkoutSection({
  exercises,
  nextWorkout,
  onCreateWorkout,
  onStartWorkout,
}: NextWorkoutSectionProps) {
  return (
    <section>
      <h2 className="text-lg font-semibold mb-4">Next Workout</h2>
      {nextWorkout ? (
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-xl font-bold mb-2">{nextWorkout.name}</h3>
            <div className="flex items-center gap-2 text-slate-600 mb-3">
              <Calendar className="w-4 h-4" />
              <span>{formatWorkoutDate(nextWorkout.date)}</span>
            </div>
            <div className="flex flex-wrap gap-1 mb-3">
              {getWorkoutMuscleGroups(nextWorkout, exercises).map((muscle) => (
                <Badge key={muscle} variant="outline" className="text-xs">
                  {muscle}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-slate-600">
              {nextWorkout.exercises.length} exercise{nextWorkout.exercises.length !== 1 ? 's' : ''}{' '}
              • {getWorkoutTotalSets(nextWorkout)} set
              {getWorkoutTotalSets(nextWorkout) !== 1 ? 's' : ''}
            </p>
          </div>
          <Button
            onClick={() => onStartWorkout(nextWorkout.id)}
            className="w-full"
          >
            <Play className="w-4 h-4 mr-2" />
            Start Workout
          </Button>
        </Card>
      ) : (
        <Card className="p-12 text-center">
          <p className="text-slate-500 mb-4">No upcoming workouts.</p>
          <p className="text-sm text-slate-500 mb-4">Create one to get started!</p>
          <Button onClick={onCreateWorkout}>
            <Plus className="w-4 h-4 mr-2" />
            Create Workout
          </Button>
        </Card>
      )}
    </section>
  );
}
