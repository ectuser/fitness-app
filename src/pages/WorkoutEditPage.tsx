import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, useLocation } from '@/lib/router-compat';
import { useExercises, useSettings, useWorkouts } from '@/hooks/useFitnessDataQueries';
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
import { consumeWorkoutFormDraft, saveWorkoutFormDraft } from '@/lib/workout-form-draft';
import type { Exercise, Workout } from '@/types';

export function WorkoutEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { exercises } = useExercises();
  const { workouts, addWorkout, updateWorkout } = useWorkouts();
  const { settings } = useSettings();
  const isEditing = !!id;
  const [loadedWorkoutId, setLoadedWorkoutId] = useState<string | null>(null);
  const [hasHydratedCreateDraft, setHasHydratedCreateDraft] = useState(false);
  const [isCreateDraftDirty, setIsCreateDraftDirty] = useState(false);
  const { clearDraft, persistDraft, restoreDraft } = useWorkoutCreateDraft();
  const shouldSkipStoredWorkoutInitializationRef = useRef(false);
  const hasRestoredDraftRef = useRef(false);
  const restoredPathnameRef = useRef<string | null>(null);

  const [name, setName] = useState(() => formatDefaultWorkoutName(new Date()));
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [errors, setErrors] = useState<{ name?: string; exercises?: string }>({});
  const {
    handleAddExercise: addExercise,
    handleMoveExerciseDown: moveExerciseDown,
    handleMoveExerciseUp: moveExerciseUp,
    handleRemoveExercise: removeExercise,
    handleReplaceExercise: replaceExercise,
    handleUpdateExercise: updateExercise,
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
    if (restoredPathnameRef.current !== location.pathname) {
      hasRestoredDraftRef.current = false;
      restoredPathnameRef.current = location.pathname;
      shouldSkipStoredWorkoutInitializationRef.current = false;
    }

    if (hasRestoredDraftRef.current) {
      return;
    }

    const draft = consumeWorkoutFormDraft(location.pathname);
    if (!draft) {
      return;
    }

    hasRestoredDraftRef.current = true;
    shouldSkipStoredWorkoutInitializationRef.current = true;
    setName(draft.name);
    setDate(draft.date);
    setWorkoutExercises(draft.workoutExercises);
    if (isEditing && id) {
      setLoadedWorkoutId(id);
    }
  }, [id, isEditing, location.pathname, setWorkoutExercises]);

  useEffect(() => {
    if (
      shouldSkipStoredWorkoutInitializationRef.current ||
      !isEditing ||
      !id ||
      loadedWorkoutId === id
    ) {
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

    if (hasRestoredDraftRef.current) {
      setHasHydratedCreateDraft(true);
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
    if (isEditing || !hasHydratedCreateDraft || !isCreateDraftDirty) {
      return;
    }

    persistDraft({
      name,
      date,
      workoutExercises,
    });
  }, [date, hasHydratedCreateDraft, isCreateDraftDirty, isEditing, name, persistDraft, workoutExercises]);

  const markCreateDraftDirty = () => {
    if (!isEditing) {
      setIsCreateDraftDirty(true);
    }
  };

  const handleNameChange = (value: string) => {
    markCreateDraftDirty();
    setName(value);
  };

  const handleDateChange = (value: string) => {
    markCreateDraftDirty();
    setDate(value);
  };

  const handleAddExercise = (exercise: Exercise) => {
    markCreateDraftDirty();
    addExercise(exercise);
  };

  const handleMoveExerciseUp = (index: number) => {
    markCreateDraftDirty();
    moveExerciseUp(index);
  };

  const handleMoveExerciseDown = (index: number) => {
    markCreateDraftDirty();
    moveExerciseDown(index);
  };

  const handleRemoveExercise = (index: number) => {
    markCreateDraftDirty();
    removeExercise(index);
  };

  const handleReplaceExercise = (index: number) => {
    markCreateDraftDirty();
    replaceExercise(index);
  };

  const handleUpdateExercise = (index: number, updatedExercise: Workout['exercises'][number]) => {
    markCreateDraftDirty();
    updateExercise(index, updatedExercise);
  };

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

  const handleEditExerciseFromWorkout = (exercise: Exercise) => {
    saveWorkoutFormDraft(location.pathname, {
      name,
      date,
      workoutExercises,
    });
    navigate(`/exercises/${exercise.id}/edit?returnTo=${encodeURIComponent(location.pathname)}`);
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
                onChange={(event) => handleNameChange(event.target.value)}
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
                onChange={(event) => handleDateChange(event.target.value)}
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
            onEditExercise={handleEditExerciseFromWorkout}
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

        <div className="pb-6">
          <div className="flex flex-col gap-3 sm:hidden">
            <Button variant="outline" onClick={() => saveWorkout(false)} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              {isEditing ? 'Save Changes' : 'Create Workout'}
            </Button>
            <Button variant="outline" onClick={() => saveWorkout(true)} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              Save and Finish Workout
            </Button>
            <Button variant="ghost" onClick={handleCancel} className="w-full">
              Cancel
            </Button>
          </div>
          <div className="hidden gap-3 sm:flex">
            <Button variant="ghost" onClick={handleCancel} className="flex-1">
              Cancel
            </Button>
            <Button variant="outline" onClick={() => saveWorkout(false)} className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              {isEditing ? 'Save Changes' : 'Create Workout'}
            </Button>
            <Button variant="outline" onClick={() => saveWorkout(true)} className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              Save and Finish Workout
            </Button>
          </div>
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
