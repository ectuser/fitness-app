import { useState } from 'react';
import type { Exercise, MuscleGroup } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface ExerciseFormProps {
  exercise?: Exercise;
  onSave: (exercise: Omit<Exercise, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

const MUSCLE_GROUPS: MuscleGroup[] = [
  'Chest',
  'Back',
  'Legs',
  'Shoulders',
  'Arms',
  'Core',
  'Full Body',
];

export function ExerciseForm({ exercise, onSave, onCancel }: ExerciseFormProps) {
  const [name, setName] = useState(exercise?.name || '');
  const [selectedMuscles, setSelectedMuscles] = useState<MuscleGroup[]>(
    exercise?.muscleGroups || []
  );
  const [comments, setComments] = useState(exercise?.comments || '');
  const [error, setError] = useState('');

  const toggleMuscle = (muscle: MuscleGroup) => {
    setSelectedMuscles((prev) =>
      prev.includes(muscle)
        ? prev.filter((m) => m !== muscle)
        : [...prev, muscle]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Exercise name is required');
      return;
    }

    if (selectedMuscles.length === 0) {
      setError('Please select at least one muscle group');
      return;
    }

    onSave({
      name: name.trim(),
      muscleGroups: selectedMuscles,
      comments: comments.trim() || undefined,
      isCustom: true,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Exercise Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Barbell Rows"
          className="text-base"
        />
      </div>

      <div className="space-y-3">
        <Label>Muscle Groups</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {MUSCLE_GROUPS.map((muscle) => {
            const isSelected = selectedMuscles.includes(muscle);
            return (
              <button
                key={muscle}
                type="button"
                onClick={() => toggleMuscle(muscle)}
                className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                  isSelected
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                {muscle}
              </button>
            );
          })}
        </div>
        {selectedMuscles.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {selectedMuscles.map((muscle) => (
              <Badge
                key={muscle}
                variant="secondary"
                className="text-sm px-3 py-1"
              >
                {muscle}
                <button
                  type="button"
                  onClick={() => toggleMuscle(muscle)}
                  className="ml-2 hover:text-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="comments">Comments (Optional)</Label>
        <textarea
          id="comments"
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          placeholder="Add notes about form, tips, or variations..."
          rows={4}
          className="w-full px-3 py-2 border border-slate-200 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit" className="flex-1">
          Save Exercise
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
