import { useEffect, useRef, useState } from 'react'
import { CheckCircle2, Plus, X } from 'lucide-react'
import { ExerciseSelector } from '../exercise/ExerciseSelector'
import { useExercises } from '../exercise/use-exercises'
import { useSettings } from '../settings/use-settings'
import { WorkoutExerciseList } from './WorkoutExerciseList'
import { useWorkouts } from './use-workouts'
import { useWorkoutExerciseEditor } from './use-workout-exercise-editor'
import type { Workout } from '@/types'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/layout/PageHeader'
import { useNavigate, useParams } from '@/lib/router-compat'
import { SimpleModal } from '@/components/ui/simple-modal'

export function WorkoutSessionPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { exercises } = useExercises()
  const { workouts, finishWorkout, saveWorkoutProgress } = useWorkouts()
  const { settings } = useSettings()

  const [workout, setWorkout] = useState<Workout | null>(null)
  const [loadedWorkoutId, setLoadedWorkoutId] = useState<string | null>(null)
  const [showFinishDialog, setShowFinishDialog] = useState(false)
  const [showExitDialog, setShowExitDialog] = useState(false)
  const lastSavedExercisesRef = useRef('')
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
  })

  useEffect(() => {
    if (!id || loadedWorkoutId === id) {
      return
    }

    const foundWorkout = workouts.find((entry) => entry.id === id)
    if (foundWorkout) {
      setWorkout(foundWorkout)
      setWorkoutExercises(foundWorkout.exercises)
      lastSavedExercisesRef.current = JSON.stringify(foundWorkout.exercises)
      setLoadedWorkoutId(id)
      if (foundWorkout.status === 'planned') {
        void saveWorkoutProgress(id, foundWorkout.exercises)
      }
    }
  }, [id, loadedWorkoutId, saveWorkoutProgress, setWorkoutExercises, workouts])

  useEffect(() => {
    if (!id || loadedWorkoutId !== id) {
      return
    }

    const serializedExercises = JSON.stringify(workoutExercises)

    if (serializedExercises === lastSavedExercisesRef.current) {
      return
    }

    lastSavedExercisesRef.current = serializedExercises
    void saveWorkoutProgress(id, workoutExercises)
  }, [id, loadedWorkoutId, saveWorkoutProgress, workoutExercises])

  if (!workout) {
    return (
      <div>
        <PageHeader title="Workout Not Found" showBack />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="mb-4 text-muted-foreground">
            This workout could not be found.
          </p>
          <Button onClick={() => navigate('/workouts')}>
            Back to Workouts
          </Button>
        </div>
      </div>
    )
  }

  const totalSets = workoutExercises.reduce(
    (sum, workoutExercise) => sum + workoutExercise.sets.length,
    0,
  )

  return (
    <div className="min-h-screen bg-muted">
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
        <div className="rounded-lg bg-card p-4 text-card-foreground shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">Workout in Progress</h3>
              <p className="text-sm text-muted-foreground">
                {workoutExercises.length} exercise
                {workoutExercises.length !== 1 ? 's' : ''} • {totalSets} set
                {totalSets !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={openAddExerciseSelector}
          variant="outline"
          className="w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Exercise
        </Button>

        <WorkoutExerciseList
          workoutExercises={workoutExercises}
          exercises={exercises}
          onChangeExercise={handleUpdateExercise}
          onMoveExerciseDown={handleMoveExerciseDown}
          onMoveExerciseUp={handleMoveExerciseUp}
          onRemoveExercise={handleRemoveExercise}
          onReplaceExercise={handleReplaceExercise}
          emptyState={
            <div className="rounded-lg bg-card p-12 text-center text-card-foreground">
              <p className="mb-4 text-muted-foreground">
                No exercises in this workout
              </p>
              <Button variant="outline" onClick={openAddExerciseSelector}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Exercise
              </Button>
            </div>
          }
        />
      </div>

      <div className="fixed bottom-16 left-0 right-0 z-40 border-t bg-card p-4 shadow-lg md:bottom-0">
        <div className="container mx-auto flex gap-3">
          <Button
            onClick={() => {
              if (id) {
                setShowFinishDialog(true)
              }
            }}
            className="flex-1 h-12 text-lg"
            disabled={workoutExercises.length === 0}
          >
            <CheckCircle2 className="w-5 h-5 mr-2" />
            Finish Workout
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

      <SimpleModal
        open={showFinishDialog}
        onClose={() => setShowFinishDialog(false)}
        role="alertdialog"
        title="Finish Workout?"
        description="Mark this workout as completed? Your progress will be saved and exercise statistics will be updated."
      >
        <div className="sm:hidden space-y-2">
          <Button
            variant="outline"
            onClick={() => {
              if (id) {
                void finishWorkout(id, workoutExercises).then(() =>
                  navigate('/workouts'),
                )
              }
            }}
            className="w-full"
          >
            Finish Workout
          </Button>
          <Button
            variant="ghost"
            onClick={() => setShowFinishDialog(false)}
            className="w-full"
          >
            Continue Workout
          </Button>
        </div>
        <div className="hidden sm:flex sm:justify-end sm:gap-2">
          <Button variant="ghost" onClick={() => setShowFinishDialog(false)}>
            Continue Workout
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              if (id) {
                void finishWorkout(id, workoutExercises).then(() =>
                  navigate('/workouts'),
                )
              }
            }}
          >
            Finish Workout
          </Button>
        </div>
      </SimpleModal>

      <SimpleModal
        open={showExitDialog}
        onClose={() => setShowExitDialog(false)}
        role="alertdialog"
        title="Exit Workout?"
        description="Your progress has been auto-saved. You can resume this workout later from the workouts page."
      >
        <div className="sm:hidden space-y-2">
          <Button
            variant="outline"
            onClick={() => navigate('/workouts')}
            className="w-full"
          >
            Exit
          </Button>
          <Button
            variant="ghost"
            onClick={() => setShowExitDialog(false)}
            className="w-full"
          >
            Continue Workout
          </Button>
        </div>
        <div className="hidden sm:flex sm:justify-end sm:gap-2">
          <Button variant="ghost" onClick={() => setShowExitDialog(false)}>
            Continue Workout
          </Button>
          <Button variant="outline" onClick={() => navigate('/workouts')}>
            Exit
          </Button>
        </div>
      </SimpleModal>
    </div>
  )
}
