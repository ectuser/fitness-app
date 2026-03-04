import { CheckCircle2, Plus, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { PageHeader } from '@/components/layout/PageHeader';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
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
import type { WorkoutExercise, Exercise, MuscleGroup } from '@/types';

export function WorkoutSessionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { workouts, exercises, updateWorkout, settings } = useData();
  const currentWorkout = id ? workouts.find((workout) => workout.id === id) ?? null : null;
  const hasWorkout = currentWorkout !== null;

  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>(
    () => currentWorkout?.exercises ?? []
  );
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [replacingExerciseIndex, setReplacingExerciseIndex] = useState<number | null>(null);
  const [selectorInitialFilterGroup, setSelectorInitialFilterGroup] = useState<MuscleGroup | null>(null);
  const [selectorSessionId, setSelectorSessionId] = useState(0);
  const [showFinishDialog, setShowFinishDialog] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const hasInitializedAutosave = useRef(false);

  // Auto-save changes to localStorage
  useEffect(() => {
    if (!id || !hasWorkout) {
      return;
    }

    if (!hasInitializedAutosave.current) {
      hasInitializedAutosave.current = true;
      return;
    }

    updateWorkout(id, {
      exercises: workoutExercises,
    });
  }, [hasWorkout, id, updateWorkout, workoutExercises]);

  if (!currentWorkout) {
    return (
      <div>
        <PageHeader title="Workout Not Found" showBack />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-slate-600 mb-4">This workout could not be found.</p>
          <Button onClick={() => navigate('/workouts')}>Back to Workouts</Button>
        </div>
      </div>
    );
  }

  const totalSets = workoutExercises.reduce((sum, we) => sum + we.sets.length, 0);

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
    setReplacingExerciseIndex(null);
    setSelectorInitialFilterGroup(null);
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

  const handleFinishWorkout = () => {
    if (id) {
      updateWorkout(id, {
        exercises: workoutExercises,
        isCompleted: true,
        completedAt: new Date().toISOString(),
      });
      navigate('/workouts');
    }
  };

  const handleExit = () => {
    // Changes are already auto-saved
    navigate('/workouts');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title={currentWorkout.name}
        showBack
        action={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowExitDialog(true)}
          >
            <X className="w-4 h-4 mr-2" />
            Exit
          </Button>
        }
      />

      <div className="container mx-auto px-4 py-6 space-y-6 pb-32">
        {/* Progress Indicator */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">Workout in Progress</h3>
              <p className="text-sm text-slate-600">
                {workoutExercises.length} exercise{workoutExercises.length !== 1 ? 's' : ''}{' '}
                • {totalSets} set{totalSets !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Add Exercise Button */}
        <Button
          onClick={openAddExerciseSelector}
          variant="outline"
          className="w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Exercise
        </Button>

        {/* Exercises */}
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
          <div className="bg-white rounded-lg p-12 text-center">
            <p className="text-slate-500 mb-4">No exercises in this workout</p>
            <Button
              variant="outline"
              onClick={openAddExerciseSelector}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Exercise
            </Button>
          </div>
        )}
      </div>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-lg z-40">
        <div className="container mx-auto flex gap-3">
          <Button
            onClick={() => setShowFinishDialog(true)}
            className="flex-1 h-12 text-lg"
            disabled={workoutExercises.length === 0}
          >
            <CheckCircle2 className="w-5 h-5 mr-2" />
            Finish Workout
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

      {/* Finish Workout Dialog */}
      <AlertDialog open={showFinishDialog} onOpenChange={setShowFinishDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Finish Workout?</AlertDialogTitle>
            <AlertDialogDescription>
              Mark this workout as completed? Your progress will be saved and
              exercise statistics will be updated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Workout</AlertDialogCancel>
            <AlertDialogAction onClick={handleFinishWorkout}>
              Finish Workout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Exit Dialog */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Exit Workout?</AlertDialogTitle>
            <AlertDialogDescription>
              Your progress has been auto-saved. You can resume this workout later
              from the workouts page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Workout</AlertDialogCancel>
            <AlertDialogAction onClick={handleExit}>Exit</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
