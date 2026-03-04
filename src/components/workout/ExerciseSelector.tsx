import { Search, Plus, Check, TrendingUp, Clock } from 'lucide-react';
import { useMemo, useState } from 'react';

import { ExerciseForm } from '@/components/exercise/ExerciseForm';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useData } from '@/context/useData';
import { useExerciseStats } from '@/hooks/useExerciseStats';
import type { Exercise, MuscleGroup } from '@/types';

interface ExerciseSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (exercise: Exercise) => void;
  selectedExerciseIds?: string[];
  initialFilterGroup?: MuscleGroup | null;
}

interface ExerciseCardProps {
  exercise: Exercise;
  isSelected: boolean;
  onClick: () => void;
}

const MUSCLE_GROUP_ORDER: MuscleGroup[] = [
  'Chest',
  'Back',
  'Shoulders',
  'Core',
  'Biceps',
  'Triceps',
  'Quads',
  'Hamstrings',
  'Glutes',
  'Calves',
  'Arms (Legacy)',
  'Legs (Legacy)',
  'None',
];

function ExerciseCard({ exercise, isSelected, onClick }: ExerciseCardProps) {
  const { workouts } = useData();
  const stats = useExerciseStats(exercise.id, workouts);

  return (
    <Card
      className={`p-4 cursor-pointer hover:bg-slate-50 transition-colors ${
        isSelected ? 'bg-slate-100 border-slate-400' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold">{exercise.name}</h3>
            {isSelected && <Check className="w-4 h-4 text-green-600" />}
          </div>
          <div className="flex flex-wrap gap-1 mb-2">
            {exercise.muscleGroups.map((muscle) => (
              <Badge key={muscle} variant="secondary" className="text-xs">
                {muscle}
              </Badge>
            ))}
          </div>
          {stats && (
            <div className="flex flex-wrap gap-3 text-xs text-slate-600 mb-2">
              {stats.maxWeight > 0 && (
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>
                    Max: {stats.maxWeight} {stats.maxWeightUnit} × {stats.maxWeightReps}
                  </span>
                </div>
              )}
              {stats.lastWeight !== undefined && stats.lastWeight > 0 && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>
                    Last: {stats.lastWeight} {stats.lastWeightUnit} × {stats.lastWeightReps}
                  </span>
                </div>
              )}
            </div>
          )}
          {exercise.comments && (
            <p className="text-sm text-slate-600 line-clamp-2">
              {exercise.comments}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

export function ExerciseSelector({
  open,
  onOpenChange,
  onSelect,
  selectedExerciseIds = [],
  initialFilterGroup = null,
}: ExerciseSelectorProps) {
  const { exercises, addExercise } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedFilterGroup, setSelectedFilterGroup] = useState<MuscleGroup | null>(() =>
    initialFilterGroup ?? null
  );

  const availableMuscleGroups = useMemo(() => {
    const uniqueGroups = new Set<MuscleGroup>();
    exercises.forEach((exercise) => {
      exercise.muscleGroups.forEach((group) => uniqueGroups.add(group));
    });

    return Array.from(uniqueGroups).sort((a, b) => {
      const aIndex = MUSCLE_GROUP_ORDER.indexOf(a);
      const bIndex = MUSCLE_GROUP_ORDER.indexOf(b);

      if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
  }, [exercises]);

  const filteredExercises = exercises.filter((exercise) => {
    const matchesSearch = exercise.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilterGroup
      ? exercise.muscleGroups.includes(selectedFilterGroup)
      : true;
    return matchesSearch && matchesFilter;
  });

  const handleExerciseSave = (exerciseData: Omit<Exercise, 'id' | 'createdAt'>) => {
    const newExercise = addExercise(exerciseData);
    setShowCreateForm(false);
    setSearchQuery('');
    // Auto-select the newly created exercise
    onSelect(newExercise);
  };

  const handleSelectExercise = (exercise: Exercise) => {
    onSelect(exercise);
  };

  if (showCreateForm) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Exercise</DialogTitle>
            <DialogDescription>
              Create a custom exercise and add it to your workout.
            </DialogDescription>
          </DialogHeader>
          <ExerciseForm
            onSave={handleExerciseSave}
            onCancel={() => setShowCreateForm(false)}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Exercise</DialogTitle>
          <DialogDescription>
            Select an exercise to add to your workout or create a new one.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Search and Create */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search exercises..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowCreateForm(true)}
              className="flex-shrink-0"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={selectedFilterGroup ?? 'all'}
              onValueChange={(value) => {
                if (value === 'all') {
                  setSelectedFilterGroup(null);
                  return;
                }
                setSelectedFilterGroup(value as MuscleGroup);
              }}
            >
              <SelectTrigger
                className={`w-full sm:w-[260px] ${
                  selectedFilterGroup ? 'border-slate-900 ring-1 ring-slate-200' : ''
                }`}
              >
                <SelectValue placeholder="Filter by muscle group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All muscle groups</SelectItem>
                {availableMuscleGroups.map((group) => (
                  <SelectItem key={group} value={group}>
                    {group}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedFilterGroup && (
              <Button
                variant="outline"
                onClick={() => setSelectedFilterGroup(null)}
              >
                Reset Filter
              </Button>
            )}
          </div>

          {selectedFilterGroup && (
            <div className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm">
              Filtering by <span className="font-semibold">{selectedFilterGroup}</span>. Reset to see all exercises.
            </div>
          )}

          {/* Exercise List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {filteredExercises.length > 0 ? (
              filteredExercises.map((exercise) => {
                const isSelected = selectedExerciseIds.includes(exercise.id);
                return (
                  <ExerciseCard
                    key={exercise.id}
                    exercise={exercise}
                    isSelected={isSelected}
                    onClick={() => handleSelectExercise(exercise)}
                  />
                );
              })
            ) : (
              <div className="text-center py-12 text-slate-500">
                <p className="mb-4">
                  {selectedFilterGroup
                    ? `No exercises found for ${selectedFilterGroup}`
                    : 'No exercises found'}
                </p>
                <Button
                  variant="outline"
                  onClick={() => setShowCreateForm(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Exercise
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
