import { z } from 'zod'

function isValidIsoCalendarDate(date: string): boolean {
  const [yearStr, monthStr, dayStr] = date.split('-')
  const year = Number(yearStr)
  const month = Number(monthStr)
  const day = Number(dayStr)

  const parsed = new Date(Date.UTC(year, month - 1, day))

  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  )
}

const WeightUnitSchema = z.enum(['kg', 'lb'])

const WorkoutSetSchema = z
  .object({
    id: z.string(),
    weight: z.number(),
    weightUnit: WeightUnitSchema,
    reps: z.number(),
  })
  .strict()

const WorkoutExerciseSchema = z
  .object({
    exerciseId: z.string(),
    sets: z.array(WorkoutSetSchema),
    order: z.number(),
    comment: z.string().optional(),
  })
  .strict()

export const WorkoutCreateDraftSchema = z
  .object({
    name: z.string(),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .refine((value) => isValidIsoCalendarDate(value), {
        message: 'Invalid calendar date',
      }),
    exercises: z.array(WorkoutExerciseSchema),
    updatedAt: z.string().datetime(),
  })
  .strict()

export type WorkoutCreateDraft = z.infer<typeof WorkoutCreateDraftSchema>

export const WORKOUT_CREATE_DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000

export type WorkoutCreateDraftInput = Omit<WorkoutCreateDraft, 'updatedAt'>

export function buildWorkoutCreateDraft(
  input: WorkoutCreateDraftInput,
  now: Date = new Date(),
): WorkoutCreateDraft {
  return WorkoutCreateDraftSchema.parse({
    ...input,
    updatedAt: now.toISOString(),
  })
}

export type ParseWorkoutCreateDraftResult =
  | { status: 'valid'; value: WorkoutCreateDraft }
  | { status: 'invalid' }
  | { status: 'expired' }

export function parseWorkoutCreateDraft(
  rawValue: string | null,
  now: Date = new Date(),
): ParseWorkoutCreateDraftResult {
  if (rawValue === null) {
    return { status: 'invalid' }
  }

  let parsedValue: unknown

  try {
    parsedValue = JSON.parse(rawValue) as unknown
  } catch {
    return { status: 'invalid' }
  }

  const parsedDraft = WorkoutCreateDraftSchema.safeParse(parsedValue)

  if (!parsedDraft.success) {
    return { status: 'invalid' }
  }

  const updatedAtMs = Date.parse(parsedDraft.data.updatedAt)

  if (Number.isNaN(updatedAtMs)) {
    return { status: 'invalid' }
  }

  if (updatedAtMs > now.getTime()) {
    return { status: 'invalid' }
  }

  if (now.getTime() - updatedAtMs > WORKOUT_CREATE_DRAFT_TTL_MS) {
    return { status: 'expired' }
  }

  return {
    status: 'valid',
    value: parsedDraft.data,
  }
}
