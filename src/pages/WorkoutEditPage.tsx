import { Plus, Save } from 'lucide-react';
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ExerciseSelector } from '@/components/workout/ExerciseSelector';
import { WorkoutExerciseCard } from '@/components/workout/WorkoutExerciseCard';
import { useData } from '@/context/useData';
import {
  addOrReplaceWorkoutExercise,
  createDefaultSets,
  findLastCompletedWorkoutExercise,
  moveWorkoutExercise,
  removeWorkoutExerciseAtIndex,
  replaceWorkoutExerciseAtIndex,
} from '@/lib/workout-exercises';
import type { Workout, WorkoutExercise, Exercise, MuscleGroup } from '@/types';

const formatDefaultWorkoutName = (date: Date): string => {
  const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
  const month = date.toLocaleDateString('en-US', { month: 'long' });
  const day = date.toLocaleDateString('en-US', { day: 'numeric' });
  return `${weekday} ${month} ${day}`;
};

export function WorkoutEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { workouts, exercises, addWorkout, updateWorkout, settings } = useData();
  const isEditing = !!id;
  const existingWorkout = isEditing && id
    ? workouts.find((workout) => workout.id === id)
    : undefined;

  const [name, setName] = useState(() => existingWorkout?.name ?? formatDefaultWorkoutName(new Date()));
  const [date, setDate] = useState(() => {
    if (existingWorkout) {
      return existingWorkout.date;
    }

    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>(
    () => existingWorkout?.exercises ?? []
  );
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [replacingExerciseIndex, setReplacingExerciseIndex] = useState<number | null>(null);
  const [selectorInitialFilterGroup, setSelectorInitialFilterGroup] = useState<MuscleGroup | null>(null);
  const [selectorSessionId, setSelectorSessionId] = useState(0);
  const [errors, setErrors] = useState<{ name?: string; exercises?: string }>({});

  const handleAddExercise = (exercise: Exercise) => {
    const lastWorkoutExercise = findLastCompletedWorkoutExercise(workouts, exercise.id);
    const defaultSets = createDefaultSets(lastWorkoutExercise, settings.defaultWeightUnit);

    const updatedExercises = addOrReplaceWorkoutExercise(
      workoutExercises,
      exercise,
      defaultSets,
      replacingExerciseIndex
    );
    setWorkoutExercises(updatedExercises);
    setSelectorInitialFilterGroup(null);
    setReplacingExerciseIndex(null);
    setShowExerciseSelector(false);
  };

  const openAddExerciseSelector = () => {
    setReplacingExerciseIndex(null);
    setSelectorInitialFilterGroup(null);
    setSelectorSessionId((current) => current + 1);
    setShowExerciseSelector(true);
  };

  const handleRemoveExercise = (index: number) => {
    setWorkoutExercises(removeWorkoutExerciseAtIndex(workoutExercises, index));
  };

  const handleMoveExerciseUp = (index: number) => {
    setWorkoutExercises(moveWorkoutExercise(workoutExercises, index, 'up'));
  };

  const handleMoveExerciseDown = (index: number) => {
    setWorkoutExercises(moveWorkoutExercise(workoutExercises, index, 'down'));
  };

  const handleUpdateExercise = (index: number, updatedExercise: WorkoutExercise) => {
    setWorkoutExercises(replaceWorkoutExerciseAtIndex(workoutExercises, index, updatedExercise));
  };

  const handleReplaceExercise = (index: number) => {
    const currentExerciseId = workoutExercises[index]?.exerciseId;
    const currentExercise = exercises.find((exercise) => exercise.id === currentExerciseId);
    setSelectorInitialFilterGroup(currentExercise?.muscleGroups[0] ?? null);
    setReplacingExerciseIndex(index);
    setSelectorSessionId((current) => current + 1);
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

  const saveWorkout = (finishWorkout: boolean) => {
    if (!validateForm()) {
      return;
    }

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
    }

    navigate(finishWorkout ? '/workouts/completed' : '/workouts');
  };

  const handleSave = () => {
    saveWorkout(false);
  };

  const handleSaveAndFinish = () => {
    saveWorkout(true);
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

          {workoutExercises.length > 0 ? (
            <div className="space-y-4">
              {workoutExercises.map((workoutExercise, index) => {
                const exercise = exercises.find(
                  (e) => e.id === workoutExercise.exerciseId
                );
                if (!exercise) return null;

                return (
                  <WorkoutExerciseCard
                    key={`${workoutExercise.exerciseId}-${index}`}
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
                onClick={openAddExerciseSelector}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Exercise
              </Button>
            </Card>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 pb-6 sm:flex-row">
          <Button variant="outline" onClick={handleSave} className="w-full sm:flex-1">
            <Save className="w-4 h-4 mr-2" />
            {isEditing ? 'Save Changes' : 'Create Workout'}
          </Button>
          <Button variant="outline" onClick={handleSaveAndFinish} className="w-full sm:flex-1">
            <Save className="w-4 h-4 mr-2" />
            Save and Finish Workout
          </Button>
          <Button variant="outline" onClick={handleCancel} className="w-full sm:flex-1">
            Cancel
          </Button>
        </div>
      </div>

      {/* Exercise Selector Dialog */}
      <ExerciseSelector
        key={`${selectorSessionId}-${selectorInitialFilterGroup ?? 'all'}`}
        open={showExerciseSelector}
        onOpenChange={setShowExerciseSelector}
        onSelect={handleAddExercise}
        selectedExerciseIds={workoutExercises.map((we) => we.exerciseId)}
        initialFilterGroup={selectorInitialFilterGroup}
      />
    </div>
  );
}
