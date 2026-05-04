import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Plus, Trash2, ChevronUp, ChevronDown, MoreVertical, Repeat, Pencil, TrendingUp, Clock } from 'lucide-react';
import type { WorkoutExercise, Exercise } from '@/types';
import { SetInput } from './SetInput';
import { useData } from '@/context/DataContext';
import { useExerciseStats } from '@/hooks/useExerciseStats';
import { useNavigate } from '@/lib/router-compat';

interface WorkoutExerciseCardProps {
  workoutExercise: WorkoutExercise;
  exercise: Exercise;
  index: number;
  totalCount: number;
  onChange: (exercise: WorkoutExercise) => void;
  onEditExercise?: (exercise: Exercise) => void;
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
  onEditExercise,
  onRemove,
  onMoveUp,
  onMoveDown,
  onReplace,
}: WorkoutExerciseCardProps) {
  const { settings, workouts } = useData();
  const stats = useExerciseStats(exercise.id, workouts);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const addSet = () => {
    const lastSet = workoutExercise.sets.at(-1);
    const newSet = {
      id: crypto.randomUUID(),
      weight: lastSet?.weight ?? 0,
      weightUnit: lastSet?.weightUnit ?? settings.defaultWeightUnit,
      reps: lastSet?.reps ?? 0,
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
  const commentId = `exercise-comment-${exercise.id}-${index}`;
  const commentValue = workoutExercise.comment ?? exercise.comments ?? '';

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-lg">
              {exercise.name}
            </h3>
          </div>
          <div className="flex flex-wrap gap-1">
            {exercise.muscleGroups.map((muscle) => (
              <Badge key={muscle} variant="secondary" className="text-xs">
                {muscle}
              </Badge>
            ))}
          </div>
        </div>

        <div className="relative flex gap-1 ml-2">
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
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen((currentValue) => !currentValue)}
          >
            <MoreVertical className="w-4 h-4" />
          </Button>
          {isMenuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-10 z-20 min-w-44 rounded-md border bg-white p-1 shadow-md"
            >
              {onReplace && (
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onReplace();
                  }}
                  className="flex w-full items-center rounded-sm px-2 py-2 text-sm hover:bg-slate-100"
                >
                  <Repeat className="w-4 h-4 mr-2" />
                  Switch Exercise
                </button>
              )}
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setIsMenuOpen(false);
                  if (onEditExercise) {
                    onEditExercise(exercise);
                    return;
                  }
                  navigate(`/exercises/${exercise.id}/edit`);
                }}
                className="flex w-full items-center rounded-sm px-2 py-2 text-sm hover:bg-slate-100"
              >
                <Pencil className="w-4 h-4 mr-2" />
                Edit Exercise
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setIsMenuOpen(false);
                  onRemove();
                }}
                className="flex w-full items-center rounded-sm px-2 py-2 text-sm text-red-600 hover:bg-slate-100"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Exercise
              </button>
            </div>
          )}
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

      <Accordion type="single" collapsible className="mb-3">
        <AccordionItem value="details" className="border-none">
          <AccordionTrigger className="py-2 text-sm font-medium">
            Details
          </AccordionTrigger>
          <AccordionContent className="space-y-3 pt-2">
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
            <div className="space-y-1">
              <label htmlFor={commentId} className="text-xs font-medium text-slate-600">
                Comment
              </label>
              <textarea
                id={commentId}
                value={commentValue}
                onChange={(event) =>
                  onChange({
                    ...workoutExercise,
                    comment: event.target.value,
                  })
                }
                placeholder="Add a note for this exercise..."
                rows={3}
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

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
