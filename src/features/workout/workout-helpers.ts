import type { Exercise, Workout, WorkoutExercise } from '@/types'

export interface DuplicateWorkoutOptions {
  createSetId?: () => string
  date?: string
  nameSuffix?: string
}

export function sortWorkoutsByDateAsc<T extends Pick<Workout, 'date'>>(
  workouts: Array<T>,
): Array<T> {
  return [...workouts].sort((a, b) => a.date.localeCompare(b.date))
}

export function sortWorkoutsByDateDesc<T extends Pick<Workout, 'date'>>(
  workouts: Array<T>,
): Array<T> {
  return [...workouts].sort((a, b) => b.date.localeCompare(a.date))
}

export function getUpcomingWorkouts(workouts: Array<Workout>): Array<Workout> {
  return sortWorkoutsByDateAsc(
    workouts.filter((workout) => workout.status !== 'completed'),
  )
}

export function getCompletedWorkouts(workouts: Array<Workout>): Array<Workout> {
  return sortWorkoutsByDateDesc(
    workouts.filter((workout) => workout.status === 'completed'),
  )
}

export function findLastWorkoutExercise(
  exerciseId: string,
  workouts: Array<Workout>,
): WorkoutExercise | null {
  for (const workout of getCompletedWorkouts(workouts)) {
    const workoutExercise = workout.exercises.find(
      (entry) => entry.exerciseId === exerciseId,
    )

    if (workoutExercise) {
      return workoutExercise
    }
  }

  return null
}

export function getNextWorkout(workouts: Array<Workout>): Workout | null {
  const today = new Date().toISOString().split('T')[0]
  const upcoming = getUpcomingWorkouts(workouts).filter(
    (workout) => workout.date >= today,
  )
  return upcoming[0] ?? null
}

export function getWorkoutTotalSets(
  workout: Pick<Workout, 'exercises'>,
): number {
  return workout.exercises.reduce(
    (sum, exercise) => sum + exercise.sets.length,
    0,
  )
}

export function getWorkoutExercises(
  workout: Pick<Workout, 'exercises'>,
  exercises: Array<Exercise>,
): Array<Exercise> {
  return workout.exercises
    .map((workoutExercise) =>
      exercises.find((exercise) => exercise.id === workoutExercise.exerciseId),
    )
    .filter((exercise): exercise is Exercise => exercise !== undefined)
}

export function getWorkoutMuscleGroups(
  workout: Pick<Workout, 'exercises'>,
  exercises: Array<Exercise>,
) {
  return Array.from(
    new Set(
      getWorkoutExercises(workout, exercises).flatMap(
        (exercise) => exercise.muscleGroups,
      ),
    ),
  )
}

export function formatWorkoutDate(
  dateString: string,
  options: { includeYesterday?: boolean } = {},
): string {
  const date = new Date(`${dateString}T00:00:00`)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.getTime() === today.getTime()) {
    return 'Today'
  }

  if (date.getTime() === tomorrow.getTime()) {
    return 'Tomorrow'
  }

  if (options.includeYesterday && date.getTime() === yesterday.getTime()) {
    return 'Yesterday'
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  })
}

export function duplicateWorkoutTemplate(
  workout: Pick<Workout, 'name' | 'date' | 'exercises'>,
  options: DuplicateWorkoutOptions = {},
): Omit<Workout, 'id' | 'createdAt' | 'updatedAt'> {
  const {
    createSetId = () => crypto.randomUUID(),
    date = new Date().toISOString().split('T')[0],
    nameSuffix = ' (Copy)',
  } = options

  return {
    name: `${workout.name}${nameSuffix}`,
    date,
    exercises: workout.exercises.map((workoutExercise: WorkoutExercise) => ({
      ...workoutExercise,
      sets: workoutExercise.sets.map((set) => ({
        ...set,
        id: createSetId(),
      })),
    })),
    status: 'planned',
    completedAt: undefined,
  }
}
