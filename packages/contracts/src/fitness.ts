import { z } from 'zod'

export const MuscleGroupSchema = z.enum([
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

export const WeightUnitSchema = z.enum(['kg', 'lb'])

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
