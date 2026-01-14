import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Plus, Trash2, ChevronUp, ChevronDown, Pencil, TrendingUp, Clock } from 'lucide-react';
import type { WorkoutExercise, Exercise } from '@/types';
import { SetInput } from './SetInput';
import { useData } from '@/context/DataContext';
import { useExerciseStats } from '@/hooks/useExerciseStats';

interface WorkoutExerciseCardProps {
  workoutExercise: WorkoutExercise;
  exercise: Exercise;
  index: number;
  totalCount: number;
  onChange: (exercise: WorkoutExercise) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onReplace?: () => void;
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
  onReplace,
}: WorkoutExerciseCardProps) {
  const { settings, workouts } = useData();
  const stats = useExerciseStats(exercise.id, workouts);

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
          <div className="flex items-center gap-2 mb-2">
            <h3
              className={`font-semibold text-lg ${onReplace ? 'cursor-pointer hover:text-blue-600 transition-colors' : ''}`}
              onClick={onReplace}
            >
              {exercise.name}
            </h3>
            {onReplace && (
              <button
                onClick={onReplace}
                className="p-1 hover:bg-slate-100 rounded transition-colors"
                aria-label="Replace exercise"
              >
                <Pencil className="w-4 h-4 text-slate-500" />
              </button>
            )}
          </div>
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

      {/* Details Accordion */}
      {(exercise.comments || stats) && (
        <Accordion type="single" collapsible className="mb-3">
          <AccordionItem value="details" className="border-none">
            <AccordionTrigger className="py-2 text-sm font-medium">
              Details
            </AccordionTrigger>
            <AccordionContent className="space-y-3 pt-2">
              {exercise.comments && (
                <div>
                  <p className="text-xs font-medium text-slate-600 mb-1">Comments</p>
                  <p className="text-sm text-slate-700">{exercise.comments}</p>
                </div>
              )}
              {stats && (
                <div className="space-y-2">
                  {stats.maxWeight > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="w-4 h-4 text-slate-500" />
                      <span className="text-slate-600">Max:</span>
                      <span className="font-semibold">
                        {stats.maxWeight} {stats.maxWeightUnit} × {stats.maxWeightReps}
                      </span>
                    </div>
                  )}
                  {stats.lastWeight !== undefined && stats.lastWeight > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-slate-500" />
                      <span className="text-slate-600">Last:</span>
                      <span className="font-semibold">
                        {stats.lastWeight} {stats.lastWeightUnit} × {stats.lastWeightReps}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

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
