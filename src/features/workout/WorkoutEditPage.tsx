import { useEffect, useRef, useState } from 'react'
import { MoreVertical, Play, Plus, Save } from 'lucide-react'
import { m } from '#/paraglide/messages'
import { ExerciseSelector } from '../exercise/ExerciseSelector'
import { useExercises } from '../exercise/use-exercises'
import { useSettings } from '../settings/use-settings'
import { WorkoutExerciseList } from './WorkoutExerciseList'
import { useWorkouts } from './use-workouts'
import { useWorkoutCreateDraft } from './use-workout-create-draft'
import { useWorkoutExerciseEditor } from './use-workout-exercise-editor'
import { formatDefaultWorkoutName, validateWorkoutForm } from './workout-editor'
import type { Exercise, Workout } from '@/types'
import {
  consumeWorkoutFormDraft,
  saveWorkoutFormDraft,
} from '@/lib/workout-form-draft'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { PageHeader } from '@/components/layout/PageHeader'
import { useLocation, useNavigate, useParams } from '@/lib/router-compat'

const WORKOUT_CREATE_ACTION_STORAGE_KEY = 'fitness-app-workout-create-action'

type CreateAction = 'create' | 'finish' | 'start'

function getStoredCreateAction(): CreateAction {
  if (typeof localStorage === 'undefined') {
    return 'create'
  }

  const action = localStorage.getItem(WORKOUT_CREATE_ACTION_STORAGE_KEY)
  return action === 'finish' || action === 'start' ? action : 'create'
}

export function WorkoutEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { exercises } = useExercises()
  const {
    workouts,
    addWorkout,
    finishWorkout,
    replaceWorkoutExercises,
    updateWorkoutDetails,
  } = useWorkouts()
  const { settings } = useSettings()
  const isEditing = !!id
  const [loadedWorkoutId, setLoadedWorkoutId] = useState<string | null>(null)
  const [hasHydratedCreateDraft, setHasHydratedCreateDraft] = useState(false)
  const [isCreateDraftDirty, setIsCreateDraftDirty] = useState(false)
  const [createAction, setCreateAction] = useState<CreateAction>(
    getStoredCreateAction,
  )
  const { clearDraft, persistDraft, restoreDraft } = useWorkoutCreateDraft()
  const shouldSkipStoredWorkoutInitializationRef = useRef(false)
  const hasRestoredDraftRef = useRef(false)
  const restoredPathnameRef = useRef<string | null>(null)

  const [name, setName] = useState(() => formatDefaultWorkoutName(new Date()))
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [errors, setErrors] = useState<{ name?: string; exercises?: string }>(
    {},
  )
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
  })

  useEffect(() => {
    if (restoredPathnameRef.current !== location.pathname) {
      hasRestoredDraftRef.current = false
      restoredPathnameRef.current = location.pathname
      shouldSkipStoredWorkoutInitializationRef.current = false
    }

    if (hasRestoredDraftRef.current) {
      return
    }

    const draft = consumeWorkoutFormDraft(location.pathname)
    if (!draft) {
      return
    }

    hasRestoredDraftRef.current = true
    shouldSkipStoredWorkoutInitializationRef.current = true
    setName(draft.name)
    setDate(draft.date)
    setWorkoutExercises(draft.workoutExercises)
    if (isEditing && id) {
      setLoadedWorkoutId(id)
    }
  }, [id, isEditing, location.pathname, setWorkoutExercises])

  useEffect(() => {
    if (
      shouldSkipStoredWorkoutInitializationRef.current ||
      !isEditing ||
      !id ||
      loadedWorkoutId === id
    ) {
      return
    }

    const workout = workouts.find((entry) => entry.id === id)
    if (workout) {
      setName(workout.name)
      setDate(workout.date)
      setWorkoutExercises(workout.exercises)
      setLoadedWorkoutId(id)
    }
  }, [id, isEditing, loadedWorkoutId, setWorkoutExercises, workouts])

  useEffect(() => {
    if (isEditing) {
      return
    }

    if (hasRestoredDraftRef.current) {
      setHasHydratedCreateDraft(true)
      return
    }

    const draft = restoreDraft()

    if (draft) {
      setName(draft.name)
      setDate(draft.date)
      setWorkoutExercises(draft.exercises)
    }

    setHasHydratedCreateDraft(true)
  }, [isEditing, restoreDraft, setWorkoutExercises])

  useEffect(() => {
    if (isEditing || !hasHydratedCreateDraft || !isCreateDraftDirty) {
      return
    }

    persistDraft({
      name,
      date,
      workoutExercises,
    })
  }, [
    date,
    hasHydratedCreateDraft,
    isCreateDraftDirty,
    isEditing,
    name,
    persistDraft,
    workoutExercises,
  ])

  const markCreateDraftDirty = () => {
    if (!isEditing) {
      setIsCreateDraftDirty(true)
    }
  }

  const handleNameChange = (value: string) => {
    markCreateDraftDirty()
    setName(value)
  }

  const handleDateChange = (value: string) => {
    markCreateDraftDirty()
    setDate(value)
  }

  const handleAddExercise = (exercise: Exercise) => {
    markCreateDraftDirty()
    addExercise(exercise)
  }

  const handleMoveExerciseUp = (index: number) => {
    markCreateDraftDirty()
    moveExerciseUp(index)
  }

  const handleMoveExerciseDown = (index: number) => {
    markCreateDraftDirty()
    moveExerciseDown(index)
  }

  const handleRemoveExercise = (index: number) => {
    markCreateDraftDirty()
    removeExercise(index)
  }

  const handleReplaceExercise = (index: number) => {
    markCreateDraftDirty()
    replaceExercise(index)
  }

  const handleUpdateExercise = (
    index: number,
    updatedExercise: Workout['exercises'][number],
  ) => {
    markCreateDraftDirty()
    updateExercise(index, updatedExercise)
  }

  const validateForm = () => {
    const nextErrors = validateWorkoutForm(name, workoutExercises)
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const saveWorkout = async (
    shouldFinishWorkout: boolean,
    startWorkout = false,
  ) => {
    if (!validateForm()) {
      return
    }

    const existingWorkout =
      isEditing && id
        ? workouts.find((workout) => workout.id === id)
        : undefined
    const completedAt = shouldFinishWorkout
      ? new Date().toISOString()
      : existingWorkout?.status === 'completed'
        ? existingWorkout.completedAt
        : undefined

    const workoutData: Omit<Workout, 'id' | 'createdAt' | 'updatedAt'> = {
      name: name.trim(),
      date,
      exercises: workoutExercises,
      status: shouldFinishWorkout
        ? 'completed'
        : (existingWorkout?.status ?? 'planned'),
      completedAt,
    }

    if (isEditing && id) {
      if (existingWorkout) {
        await updateWorkoutDetails(id, {
          name: workoutData.name,
          date: workoutData.date,
        })
        if (shouldFinishWorkout) {
          await finishWorkout(id, workoutData.exercises)
        } else {
          await replaceWorkoutExercises(id, workoutData.exercises)
        }
      }
    } else {
      const createdWorkout = await addWorkout(workoutData)
      clearDraft()

      if (startWorkout) {
        navigate(`/workouts/${createdWorkout.id}/session`)
        return
      }
    }

    navigate(shouldFinishWorkout ? '/workouts/completed' : '/workouts')
  }

  const handleCancel = () => {
    if (!isEditing) {
      clearDraft()
    }

    navigate('/workouts')
  }

  const createActionDetails = {
    create: { label: m.shiny_indigo_viper(), icon: Save, finishWorkout: false },
    finish: { label: m.jolly_pearl_lynx(), icon: Save, finishWorkout: true },
    start: { label: m.jumpy_lime_swan(), icon: Play, finishWorkout: false },
  } as const
  const selectedCreateAction = createActionDetails[createAction]

  const handleCreateAction = (action: CreateAction) => {
    setCreateAction(action)
    localStorage.setItem(WORKOUT_CREATE_ACTION_STORAGE_KEY, action)
    const details = createActionDetails[action]
    void saveWorkout(details.finishWorkout, action === 'start')
  }

  const handleEditExerciseFromWorkout = (exercise: Exercise) => {
    saveWorkoutFormDraft(location.pathname, {
      name,
      date,
      workoutExercises,
    })
    navigate(
      `/exercises/${exercise.id}/edit?returnTo=${encodeURIComponent(location.pathname)}`,
    )
  }

  return (
    <div>
      <PageHeader
        title={isEditing ? m.tidy_amber_crow() : m.upbeat_azure_finch()}
        showBack
      />

      <div className="container mx-auto px-4 py-6 space-y-6">
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">{m.lively_rose_yak()}</Label>
              <Input
                id="name"
                value={name}
                onChange={(event) => handleNameChange(event.target.value)}
                placeholder={m.bold_tan_jaguar()}
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-destructive-muted-foreground">
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="date">{m.icy_navy_swan()}</Label>
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
            <h2 className="text-lg font-semibold">{m.gentle_peach_lemur()}</h2>
            <Button onClick={openAddExerciseSelector}>
              <Plus className="w-4 h-4 mr-2" />
              {m.bold_mint_puma()}
            </Button>
          </div>

          {errors.exercises && (
            <div className="mb-4 rounded-lg border border-destructive bg-destructive-muted p-3">
              <p className="text-sm text-destructive-muted-foreground">
                {errors.exercises}
              </p>
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
                <p className="mb-4 text-muted-foreground">
                  {m.brave_mint_swan()}
                </p>
                <Button variant="outline" onClick={openAddExerciseSelector}>
                  <Plus className="w-4 h-4 mr-2" />
                  {m.tender_pearl_sloth()}
                </Button>
              </Card>
            }
          />
        </div>

        <div className="pb-6">
          {isEditing ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button variant="ghost" onClick={handleCancel}>
                {m.shiny_pearl_lion()}
              </Button>
              <Button variant="outline" onClick={() => void saveWorkout(false)}>
                <Save className="w-4 h-4 mr-2" />
                {m.sleepy_ivory_ferret()}
              </Button>
              <Button variant="outline" onClick={() => void saveWorkout(true)}>
                <Save className="w-4 h-4 mr-2" />
                {m.vivid_violet_crane()}
              </Button>
            </div>
          ) : (
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={handleCancel}>
                {m.shiny_pearl_lion()}
              </Button>
              <Button
                variant="outline"
                onClick={() => handleCreateAction(createAction)}
              >
                <selectedCreateAction.icon className="w-4 h-4 mr-2" />
                {selectedCreateAction.label}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label={m.nimble_slate_crow()}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => handleCreateAction('create')}
                  >
                    <Save className="w-4 h-4" />
                    {m.shiny_indigo_viper()}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleCreateAction('finish')}
                  >
                    <Save className="w-4 h-4" />
                    {m.jolly_pearl_lynx()}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleCreateAction('start')}>
                    <Play className="w-4 h-4" />
                    {m.jumpy_lime_swan()}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
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
  )
}
