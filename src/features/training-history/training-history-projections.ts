import {
  findLastWorkoutExercise,
  getCompletedWorkouts,
  sortWorkoutsByDateDesc,
} from '../workout/workout-helpers'
import type {
  ExerciseStats,
  WeightUnit,
  Workout,
  WorkoutHistory,
} from '@/types'

export { findLastWorkoutExercise } from '../workout/workout-helpers'

type ExerciseSetSnapshot = {
  reps: number
  unit: WeightUnit
  weight: number
}

function collectExerciseSets(
  exerciseId: string,
  workouts: Array<Workout>,
): Array<ExerciseSetSnapshot> {
  const exerciseSets: Array<ExerciseSetSnapshot> = []

  getCompletedWorkouts(workouts).forEach((workout) => {
    workout.exercises.forEach((workoutExercise) => {
      if (workoutExercise.exerciseId !== exerciseId) {
        return
      }

      workoutExercise.sets.forEach((set) => {
        exerciseSets.push({
          weight: set.weight,
          reps: set.reps,
          unit: set.weightUnit,
        })
      })
    })
  })

  return exerciseSets
}

export function calculateExerciseStats(
  exerciseId: string,
  workouts: Array<Workout>,
): ExerciseStats | null {
  const exerciseSets = collectExerciseSets(exerciseId, workouts)

  if (exerciseSets.length === 0) {
    return null
  }

  let maxWeight = 0
  let maxWeightReps = 0
  let maxWeightUnit: WeightUnit = 'kg'

  exerciseSets.forEach((set) => {
    if (set.weight > maxWeight) {
      maxWeight = set.weight
      maxWeightReps = set.reps
      maxWeightUnit = set.unit
    }
  })

  const lastWorkoutExercise = findLastWorkoutExercise(exerciseId, workouts)
  const firstSet = lastWorkoutExercise ? lastWorkoutExercise.sets[0] : undefined
  const lastWorkout = sortWorkoutsByDateDesc(
    getCompletedWorkouts(workouts).filter((workout) =>
      workout.exercises.some(
        (workoutExercise) => workoutExercise.exerciseId === exerciseId,
      ),
    ),
  )[0]

  return {
    exerciseId,
    maxWeight,
    maxWeightReps,
    maxWeightUnit,
    lastWeight: firstSet?.weight,
    lastWeightReps: firstSet?.reps,
    lastWeightUnit: firstSet?.weightUnit,
    totalSets: exerciseSets.length,
    lastPerformed: lastWorkout.date,
  }
}

export function buildExerciseHistory(
  exerciseId: string,
  workouts: Array<Workout>,
): Array<WorkoutHistory> {
  const history: Array<WorkoutHistory> = []

  getCompletedWorkouts(workouts).forEach((workout) => {
    workout.exercises.forEach((workoutExercise) => {
      if (workoutExercise.exerciseId !== exerciseId) {
        return
      }

      history.push({
        workoutId: workout.id,
        workoutName: workout.name,
        date: workout.date,
        setData: workoutExercise.sets,
      })
    })
  })

  return sortWorkoutsByDateDesc(history)
}

export const WORKOUT_CALENDAR_WINDOW_DAYS = 30

export interface WorkoutCalendarCell {
  /** Local calendar date as YYYY-MM-DD. */
  date: string
  dayOfMonth: number
  /** Completed workouts whose completion falls on this local day. */
  workoutCount: number
  /** False for placeholder cells outside the 30-day window. */
  isInWindow: boolean
  isToday: boolean
}

function toLocalDateKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${date.getFullYear()}-${month}-${day}`
}

function addLocalDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)
}

// getDay(): 0 = Sunday. Result: 0 for Monday .. 6 for Sunday.
function daysSinceMonday(date: Date): number {
  return (date.getDay() + 6) % 7
}

export function buildWorkoutCalendar(
  workouts: Array<Workout>,
  today: Date,
): Array<WorkoutCalendarCell> {
  const todayStart = addLocalDays(today, 0)
  const windowStart = addLocalDays(
    todayStart,
    -(WORKOUT_CALENDAR_WINDOW_DAYS - 1),
  )
  const todayKey = toLocalDateKey(todayStart)
  const windowStartKey = toLocalDateKey(windowStart)

  const countsByDay = new Map<string, number>()
  workouts.forEach((workout) => {
    if (workout.status !== 'completed' || !workout.completedAt) {
      return
    }

    const key = toLocalDateKey(new Date(workout.completedAt))
    countsByDay.set(key, (countsByDay.get(key) ?? 0) + 1)
  })

  const gridStart = addLocalDays(windowStart, -daysSinceMonday(windowStart))
  const gridEnd = addLocalDays(todayStart, 6 - daysSinceMonday(todayStart))

  const cells: Array<WorkoutCalendarCell> = []
  for (
    let day = gridStart;
    day.getTime() <= gridEnd.getTime();
    day = addLocalDays(day, 1)
  ) {
    const key = toLocalDateKey(day)
    const isInWindow = key >= windowStartKey && key <= todayKey

    cells.push({
      date: key,
      dayOfMonth: day.getDate(),
      workoutCount: isInWindow ? (countsByDay.get(key) ?? 0) : 0,
      isInWindow,
      isToday: key === todayKey,
    })
  }

  return cells
}
