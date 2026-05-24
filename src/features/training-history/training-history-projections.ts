import type {
  ExerciseStats,
  Workout,
  WorkoutExercise,
  WorkoutHistory,
  WeightUnit,
} from '@/types'
import { getCompletedWorkouts, sortWorkoutsByDateDesc } from '../workout/workout-helpers'

type ExerciseSetSnapshot = {
  reps: number
  unit: WeightUnit
  weight: number
}

function collectExerciseSets(
  exerciseId: string,
  workouts: Workout[],
): ExerciseSetSnapshot[] {
  const exerciseSets: ExerciseSetSnapshot[] = []

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
  workouts: Workout[],
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
  workouts: Workout[],
): WorkoutHistory[] {
  const history: WorkoutHistory[] = []

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

export function findLastWorkoutExercise(
  exerciseId: string,
  workouts: Workout[],
): WorkoutExercise | null {
  for (const workout of sortWorkoutsByDateDesc(
    getCompletedWorkouts(workouts),
  )) {
    const workoutExercise = workout.exercises.find(
      (entry) => entry.exerciseId === exerciseId,
    )

    if (workoutExercise) {
      return workoutExercise
    }
  }

  return null
}
