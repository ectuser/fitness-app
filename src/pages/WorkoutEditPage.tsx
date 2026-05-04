import { useEffect, useState } from 'react';
import { useParams, useNavigate } from '@/lib/router-compat';
import { useData } from '@/context/DataContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Plus, Save } from 'lucide-react';
import { ExerciseSelector } from '@/components/workout/ExerciseSelector';
import { WorkoutExerciseList } from '@/components/workout/WorkoutExerciseList';
import { useWorkoutCreateDraft } from '@/hooks/useWorkoutCreateDraft';
import { useWorkoutExerciseEditor } from '@/hooks/useWorkoutExerciseEditor';
import { formatDefaultWorkoutName, validateWorkoutForm } from '@/lib/workout-editor';
import type { Workout } from '@/types';

export function WorkoutEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { workouts, exercises, addWorkout, updateWorkout, settings } = useData();
  const isEditing = !!id;
  const [loadedWorkoutId, setLoadedWorkoutId] = useState<string | null>(null);
  const [hasHydratedCreateDraft, setHasHydratedCreateDraft] = useState(false);
  const { clearDraft, persistDraft, restoreDraft } = useWorkoutCreateDraft();

  const [name, setName] = useState(() => formatDefaultWorkoutName(new Date()));
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [errors, setErrors] = useState<{ name?: string; exercises?: string }>({});
  const {
    handleAddExercise,
    handleMoveExerciseDown,
    handleMoveExerciseUp,
    handleRemoveExercise,
    handleReplaceExercise,
    handleUpdateExercise,
    openAddExerciseSelector,
    selectedExerciseIds,
    selectorInitialFilterGroup,
    setWorkoutExercises,
    setShowExerciseSelector,
    showExerciseSelector,
    workoutExercises,
  } = useWorkoutExerciseEditor({
    defaultWeightUnit: settings.defaultWeightUnit,
    exercises,
    initialWorkoutExercises: [],
    workouts,
  });

  useEffect(() => {
    if (!isEditing || !id || loadedWorkoutId === id) {
      return;
    }

    const workout = workouts.find((entry) => entry.id === id);
    if (workout) {
      setName(workout.name);
      setDate(workout.date);
      setWorkoutExercises(workout.exercises);
      setLoadedWorkoutId(id);
    }
  }, [id, isEditing, loadedWorkoutId, setWorkoutExercises, workouts]);

  useEffect(() => {
    if (isEditing) {
      return;
    }

    const draft = restoreDraft();

    if (draft) {
      setName(draft.name);
      setDate(draft.date);
      setWorkoutExercises(draft.exercises);
    }

    setHasHydratedCreateDraft(true);
  }, [isEditing, restoreDraft, setWorkoutExercises]);

  useEffect(() => {
    if (isEditing || !hasHydratedCreateDraft) {
      return;
    }

    persistDraft({
      name,
      date,
      workoutExercises,
    });
  }, [date, hasHydratedCreateDraft, isEditing, name, persistDraft, workoutExercises]);

  const validateForm = () => {
    const nextErrors = validateWorkoutForm(name, workoutExercises);
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const saveWorkout = (finishWorkout: boolean) => {
    if (!validateForm()) {
      return;
    }

    const existingWorkout = isEditing && id
      ? workouts.find((workout) => workout.id === id)
      : undefined;
    const completedAt = finishWorkout
      ? new Date().toISOString()
      : existingWorkout?.isCompleted
        ? existingWorkout.completedAt
        : undefined;

    const workoutData: Omit<Workout, 'id' | 'createdAt' | 'updatedAt'> = {
      name: name.trim(),
      date,
      exercises: workoutExercises,
      isCompleted: finishWorkout ? true : existingWorkout?.isCompleted ?? false,
      completedAt,
    };

    if (isEditing && id) {
      if (existingWorkout) {
        updateWorkout(id, workoutData);
      }
    } else {
      addWorkout(workoutData);
      clearDraft();
    }

    navigate(finishWorkout ? '/workouts/completed' : '/workouts');
  };

  const handleCancel = () => {
    if (!isEditing) {
      clearDraft();
    }

    navigate('/workouts');
  };

  return (
    <div>
      <PageHeader
        title={isEditing ? 'Edit Workout' : 'Create Workout'}
        showBack
      />

      <div className="container mx-auto px-4 py-6 space-y-6">
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Workout Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
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
                onChange={(event) => setDate(event.target.value)}
              />
            </div>
          </div>
        </Card>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Exercises</h2>
            <Button onClick={openAddExerciseSelector}>
              <Plus className="w-4 h-4 mr-2" />
              Add Exercise
            </Button>
          </div>

          {errors.exercises && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.exercises}</p>
            </div>
          )}

          <WorkoutExerciseList
            workoutExercises={workoutExercises}
            exercises={exercises}
            onChangeExercise={handleUpdateExercise}
            onMoveExerciseDown={handleMoveExerciseDown}
            onMoveExerciseUp={handleMoveExerciseUp}
            onRemoveExercise={handleRemoveExercise}
            onReplaceExercise={handleReplaceExercise}
            emptyState={
              <Card className="p-12 text-center">
                <p className="text-slate-500 mb-4">No exercises added yet</p>
                <Button
                  variant="outline"
                  onClick={openAddExerciseSelector}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Exercise
                </Button>
              </Card>
            }
          />
        </div>

        <div className="flex flex-col gap-3 pb-6 sm:flex-row">
          <Button variant="outline" onClick={() => saveWorkout(false)} className="w-full sm:flex-1">
            <Save className="w-4 h-4 mr-2" />
            {isEditing ? 'Save Changes' : 'Create Workout'}
          </Button>
          <Button variant="outline" onClick={() => saveWorkout(true)} className="w-full sm:flex-1">
            <Save className="w-4 h-4 mr-2" />
            Save and Finish Workout
          </Button>
          <Button variant="outline" onClick={handleCancel} className="w-full sm:flex-1">
            Cancel
          </Button>
        </div>
      </div>

      <ExerciseSelector
        open={showExerciseSelector}
        onOpenChange={setShowExerciseSelector}
        onSelect={handleAddExercise}
        selectedExerciseIds={selectedExerciseIds}
        initialFilterGroup={selectorInitialFilterGroup}
      />
    </div>
  );
}
