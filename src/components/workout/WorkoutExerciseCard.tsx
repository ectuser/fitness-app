import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import type { WorkoutExercise, Exercise } from '@/types';
import { SetInput } from './SetInput';
import { useData } from '@/context/DataContext';

interface WorkoutExerciseCardProps {
  workoutExercise: WorkoutExercise;
  exercise: Exercise;
  index: number;
  totalCount: number;
  onChange: (exercise: WorkoutExercise) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export function WorkoutExerciseCard({
  workoutExercise,
  exercise,
  index,
  totalCount,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
}: WorkoutExerciseCardProps) {
  const { settings } = useData();

  const addSet = () => {
    const lastSet = workoutExercise.sets[workoutExercise.sets.length - 1];
    const newSet = {
      id: crypto.randomUUID(),
      weight: lastSet?.weight || 0,
      weightUnit: lastSet?.weightUnit || settings.defaultWeightUnit,
      reps: lastSet?.reps || 0,
    };
    onChange({
      ...workoutExercise,
      sets: [...workoutExercise.sets, newSet],
    });
  };

  const updateSet = (setId: string, updatedSet: typeof workoutExercise.sets[0]) => {
    onChange({
      ...workoutExercise,
      sets: workoutExercise.sets.map((s) => (s.id === setId ? updatedSet : s)),
    });
  };

  const removeSet = (setId: string) => {
    onChange({
      ...workoutExercise,
      sets: workoutExercise.sets.filter((s) => s.id !== setId),
    });
  };

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-2">{exercise.name}</h3>
          <div className="flex flex-wrap gap-1">
            {exercise.muscleGroups.map((muscle) => (
              <Badge key={muscle} variant="secondary" className="text-xs">
                {muscle}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex gap-1 ml-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMoveUp}
            disabled={index === 0}
          >
            <ChevronUp className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onMoveDown}
            disabled={index === totalCount - 1}
          >
            <ChevronDown className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onRemove}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2 mb-3">
        {workoutExercise.sets.map((set, idx) => (
          <SetInput
            key={set.id}
            set={set}
            setNumber={idx + 1}
            onChange={(updatedSet) => updateSet(set.id, updatedSet)}
            onRemove={() => removeSet(set.id)}
          />
        ))}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={addSet}
        className="w-full"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Set
      </Button>
    </Card>
  );
}
