import { z } from 'zod'

const MuscleGroupSchema = z.enum([
  'Chest',
  'Back',
  'Shoulders',
  'Core',
  'Biceps',
  'Triceps',
  'Quads',
  'Hamstrings',
  'Glutes',
  'Calves',
  'Arms (Legacy)',
  'Legs (Legacy)',
  'None',
])

const WeightUnitSchema = z.enum(['kg', 'lb'])

export const ExerciseSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().trim().min(1),
    muscleGroups: z.array(MuscleGroupSchema).min(1),
    comments: z.string().optional(),
    isCustom: z.boolean(),
    createdAt: z.string().datetime(),
  })
  .strict()

export const ExerciseListSchema = z.array(ExerciseSchema)

export const WorkoutSetSchema = z
  .object({
    id: z.string().min(1),
    weight: z.number().finite().min(0),
    weightUnit: WeightUnitSchema,
    reps: z.number().int().min(0),
  })
  .strict()

export const WorkoutExerciseSchema = z
  .object({
    exerciseId: z.string().min(1),
    sets: z.array(WorkoutSetSchema),
    order: z.number().int().min(0),
    comment: z.string().optional(),
  })
  .strict()

export const WorkoutStatusSchema = z.enum([
  'planned',
  'in_progress',
  'completed',
])

export const WorkoutSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().trim().min(1),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    exercises: z.array(WorkoutExerciseSchema),
    status: WorkoutStatusSchema,
    completedAt: z.string().datetime().optional(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .strict()
  .superRefine((workout, context) => {
    if (workout.status === 'completed' && !workout.completedAt) {
      context.addIssue({
        code: 'custom',
        message: 'Completed workouts require completedAt',
        path: ['completedAt'],
      })
    }

    if (workout.status !== 'completed' && workout.completedAt) {
      context.addIssue({
        code: 'custom',
        message: 'Only completed workouts can have completedAt',
        path: ['completedAt'],
      })
    }
  })

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
    settings: SettingsSchema.optional(),
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
