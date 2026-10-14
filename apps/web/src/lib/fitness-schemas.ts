import { z } from 'zod'
import {
  ExerciseSchema,
  WeightUnitSchema,
  WorkoutSchema,
} from '@fitness/contracts'

export {
  ExerciseSchema,
  MuscleGroupSchema,
  WeightUnitSchema,
  WorkoutExerciseSchema,
  WorkoutSchema,
  WorkoutSetSchema,
  WorkoutStatusSchema,
} from '@fitness/contracts'

export const ExerciseListSchema = z.array(ExerciseSchema)

export const WorkoutListSchema = z.array(WorkoutSchema)

export const SettingsSchema = z
  .object({
    defaultWeightUnit: WeightUnitSchema,
    themeMode: z.enum(['light', 'dark', 'system']),
  })
  .strict()

export const ImportPayloadSchema = z
  .object({
    exercises: z.array(ExerciseSchema),
    workouts: z.array(WorkoutSchema),
    settings: SettingsSchema.partial().optional(),
  })
  .strict()
  .superRefine((payload, context) => {
    const exerciseIds = new Set(
      payload.exercises.map((exercise) => exercise.id),
    )

    payload.workouts.forEach((workout, workoutIndex) => {
      const orders = new Set<number>()

      workout.exercises.forEach((workoutExercise, exerciseIndex) => {
        if (!exerciseIds.has(workoutExercise.exerciseId)) {
          context.addIssue({
            code: 'custom',
            message: 'Workout references an unknown exercise',
            path: [
              'workouts',
              workoutIndex,
              'exercises',
              exerciseIndex,
              'exerciseId',
            ],
          })
        }

        if (orders.has(workoutExercise.order)) {
          context.addIssue({
            code: 'custom',
            message: 'Workout exercise order must be unique',
            path: [
              'workouts',
              workoutIndex,
              'exercises',
              exerciseIndex,
              'order',
            ],
          })
        }
        orders.add(workoutExercise.order)
      })
    })
  })

export const ImportPayloadEnvelopeSchema = z
  .object({
    exercises: z.array(
      z
        .object({
          muscleGroups: z.array(z.string()),
        })
        .passthrough(),
    ),
    workouts: z.array(z.unknown()),
    settings: z.unknown().optional(),
  })
  .passthrough()

export type ImportPayloadData = z.infer<typeof ImportPayloadSchema>
