import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Plus, Save } from 'lucide-react';
import { WorkoutExerciseCard } from '@/components/workout/WorkoutExerciseCard';
import { ExerciseSelector } from '@/components/workout/ExerciseSelector';
import type { Workout, WorkoutExercise, Exercise } from '@/types';

export function WorkoutEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { workouts, exercises, addWorkout, updateWorkout, settings } = useData();
  const isEditing = !!id;

  const [name, setName] = useState('');
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>([]);
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [replacingExerciseIndex, setReplacingExerciseIndex] = useState<number | null>(null);
  const [errors, setErrors] = useState<{ name?: string; exercises?: string }>({});

  useEffect(() => {
    if (isEditing) {
      const workout = workouts.find((w) => w.id === id);
      if (workout) {
        setName(workout.name);
        setDate(workout.date);
        setWorkoutExercises(workout.exercises);
      }
    }
  }, [id, workouts, isEditing]);

  const handleAddExercise = (exercise: Exercise) => {
    // Handle replacing an existing exercise
    if (replacingExerciseIndex !== null) {
      const updated = [...workoutExercises];
      updated[replacingExerciseIndex] = {
        exerciseId: exercise.id,
        sets: [
          {
            id: crypto.randomUUID(),
            weight: 0,
            weightUnit: settings.defaultWeightUnit,
            reps: 0,
          },
        ],
        order: replacingExerciseIndex,
      };
      setWorkoutExercises(updated);
      setReplacingExerciseIndex(null);
      setShowExerciseSelector(false);
      return;
    }

    // Check if exercise is already added
    const exists = workoutExercises.some((we) => we.exerciseId === exercise.id);
    if (exists) {
      setShowExerciseSelector(false);
      return;
    }

    const newWorkoutExercise: WorkoutExercise = {
      exerciseId: exercise.id,
      sets: [
        {
          id: crypto.randomUUID(),
          weight: 0,
          weightUnit: settings.defaultWeightUnit,
          reps: 0,
        },
      ],
      order: workoutExercises.length,
    };

    setWorkoutExercises([...workoutExercises, newWorkoutExercise]);
    setShowExerciseSelector(false);
  };

  const handleRemoveExercise = (index: number) => {
    const updated = workoutExercises.filter((_, i) => i !== index);
    // Reassign order
    const reordered = updated.map((we, idx) => ({ ...we, order: idx }));
    setWorkoutExercises(reordered);
  };

  const handleMoveExerciseUp = (index: number) => {
    if (index === 0) return;
    const updated = [...workoutExercises];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    // Reassign order
    const reordered = updated.map((we, idx) => ({ ...we, order: idx }));
    setWorkoutExercises(reordered);
  };

  const handleMoveExerciseDown = (index: number) => {
    if (index === workoutExercises.length - 1) return;
    const updated = [...workoutExercises];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    // Reassign order
    const reordered = updated.map((we, idx) => ({ ...we, order: idx }));
    setWorkoutExercises(reordered);
  };

  const handleUpdateExercise = (index: number, updatedExercise: WorkoutExercise) => {
    const updated = [...workoutExercises];
    updated[index] = updatedExercise;
    setWorkoutExercises(updated);
  };

  const handleReplaceExercise = (index: number) => {
    setReplacingExerciseIndex(index);
    setShowExerciseSelector(true);
  };

  const validateForm = () => {
    const newErrors: { name?: string; exercises?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Workout name is required';
    }

    if (workoutExercises.length === 0) {
      newErrors.exercises = 'Add at least one exercise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    const workoutData: Omit<Workout, 'id' | 'createdAt' | 'updatedAt'> = {
      name: name.trim(),
      date,
      exercises: workoutExercises,
      isCompleted: false,
    };

    if (isEditing && id) {
      const existingWorkout = workouts.find((w) => w.id === id);
      if (existingWorkout) {
        updateWorkout(id, workoutData);
      }
    } else {
      addWorkout(workoutData);
    }

    navigate('/workouts');
  };

  const handleCancel = () => {
    navigate('/workouts');
  };

  return (
    <div>
      <PageHeader
        title={isEditing ? 'Edit Workout' : 'Create Workout'}
        showBack
      />

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Workout Details */}
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Workout Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Upper Body Day"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-600 mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* Exercises */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Exercises</h2>
            <Button onClick={() => setShowExerciseSelector(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Exercise
            </Button>
          </div>

          {errors.exercises && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.exercises}</p>
            </div>
          )}

          {workoutExercises.length > 0 ? (
            <div className="space-y-4">
              {workoutExercises.map((workoutExercise, index) => {
                const exercise = exercises.find(
                  (e) => e.id === workoutExercise.exerciseId
                );
                if (!exercise) return null;

                return (
                  <WorkoutExerciseCard
                    key={workoutExercise.exerciseId}
                    workoutExercise={workoutExercise}
                    exercise={exercise}
                    index={index}
                    totalCount={workoutExercises.length}
                    onChange={(updated) => handleUpdateExercise(index, updated)}
                    onRemove={() => handleRemoveExercise(index)}
                    onMoveUp={() => handleMoveExerciseUp(index)}
                    onMoveDown={() => handleMoveExerciseDown(index)}
                    onReplace={() => handleReplaceExercise(index)}
                  />
                );
              })}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <p className="text-slate-500 mb-4">No exercises added yet</p>
              <Button
                variant="outline"
                onClick={() => setShowExerciseSelector(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Exercise
              </Button>
            </Card>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pb-6">
          <Button onClick={handleSave} className="flex-1">
            <Save className="w-4 h-4 mr-2" />
            {isEditing ? 'Save Changes' : 'Create Workout'}
          </Button>
          <Button variant="outline" onClick={handleCancel} className="flex-1">
            Cancel
          </Button>
        </div>
      </div>

      {/* Exercise Selector Dialog */}
      <ExerciseSelector
        open={showExerciseSelector}
        onOpenChange={setShowExerciseSelector}
        onSelect={handleAddExercise}
        selectedExerciseIds={workoutExercises.map((we) => we.exerciseId)}
      />
    </div>
  );
}
