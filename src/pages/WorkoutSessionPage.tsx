import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
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
import { CheckCircle2, Plus, X } from 'lucide-react';
import { WorkoutExerciseCard } from '@/components/workout/WorkoutExerciseCard';
import { ExerciseSelector } from '@/components/workout/ExerciseSelector';
import type { Workout, WorkoutExercise, Exercise } from '@/types';

export function WorkoutSessionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { workouts, exercises, updateWorkout, settings } = useData();

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>([]);
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [replacingExerciseIndex, setReplacingExerciseIndex] = useState<number | null>(null);
  const [showFinishDialog, setShowFinishDialog] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);

  useEffect(() => {
    const foundWorkout = workouts.find((w) => w.id === id);
    if (foundWorkout) {
      setWorkout(foundWorkout);
      setWorkoutExercises(foundWorkout.exercises);
    }
  }, [id, workouts]);

  // Auto-save changes to localStorage
  useEffect(() => {
    if (workout && id && workoutExercises.length > 0) {
      updateWorkout(id, {
        exercises: workoutExercises,
      });
    }
  }, [workoutExercises, id]);

  if (!workout) {
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
    // Find last workout data for this exercise
    const completedWorkouts = workouts.filter((w) => w.isCompleted);
    const sortedWorkouts = [...completedWorkouts].sort((a, b) =>
      b.date.localeCompare(a.date)
    );

    let lastWorkoutExercise: WorkoutExercise | null = null;
    for (const workout of sortedWorkouts) {
      const found = workout.exercises.find((we) => we.exerciseId === exercise.id);
      if (found) {
        lastWorkoutExercise = found;
        break;
      }
    }

    // Create default sets based on last workout or use defaults
    const defaultSets = lastWorkoutExercise
      ? lastWorkoutExercise.sets.map((set) => ({
          id: crypto.randomUUID(),
          weight: set.weight,
          weightUnit: set.weightUnit,
          reps: set.reps,
        }))
      : [
          {
            id: crypto.randomUUID(),
            weight: 0,
            weightUnit: settings.defaultWeightUnit,
            reps: 0,
          },
        ];

    // Handle replacing an existing exercise
    if (replacingExerciseIndex !== null) {
      const updated = [...workoutExercises];
      updated[replacingExerciseIndex] = {
        exerciseId: exercise.id,
        sets: defaultSets,
        order: replacingExerciseIndex,
      };
      setWorkoutExercises(updated);
      setReplacingExerciseIndex(null);
      setShowExerciseSelector(false);
      return;
    }

    const newWorkoutExercise: WorkoutExercise = {
      exerciseId: exercise.id,
      sets: defaultSets,
      order: workoutExercises.length,
    };

    setWorkoutExercises([...workoutExercises, newWorkoutExercise]);
    setShowExerciseSelector(false);
  };

  const handleRemoveExercise = (index: number) => {
    const updated = workoutExercises.filter((_, i) => i !== index);
    const reordered = updated.map((we, idx) => ({ ...we, order: idx }));
    setWorkoutExercises(reordered);
  };

  const handleMoveExerciseUp = (index: number) => {
    if (index === 0) return;
    const updated = [...workoutExercises];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    const reordered = updated.map((we, idx) => ({ ...we, order: idx }));
    setWorkoutExercises(reordered);
  };

  const handleMoveExerciseDown = (index: number) => {
    if (index === workoutExercises.length - 1) return;
    const updated = [...workoutExercises];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
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
        title={workout.name}
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
          onClick={() => setShowExerciseSelector(true)}
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
              onClick={() => setShowExerciseSelector(true)}
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
        open={showExerciseSelector}
        onOpenChange={setShowExerciseSelector}
        onSelect={handleAddExercise}
        selectedExerciseIds={workoutExercises.map((we) => we.exerciseId)}
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
