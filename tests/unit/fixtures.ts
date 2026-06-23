import type { Exercise, Workout, WorkoutExercise } from '@/types'

export const exercises: Array<Exercise> = [
  {
    id: 'exercise-bench',
    name: 'Bench Press',
    muscleGroups: ['Chest', 'Triceps'],
    comments: 'Drive through your feet.',
    isCustom: false,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'exercise-row',
    name: 'Barbell Row',
    muscleGroups: ['Back', 'Biceps'],
    comments: 'Keep your chest up.',
    isCustom: true,
    createdAt: '2026-01-02T00:00:00.000Z',
  },
  {
    id: 'exercise-plank',
    name: 'Plank',
    muscleGroups: ['Core'],
    isCustom: false,
    createdAt: '2026-01-03T00:00:00.000Z',
  },
]

export function createWorkoutExercise(
  exerciseId: string,
  overrides: Partial<WorkoutExercise> = {},
): WorkoutExercise {
  return {
    exerciseId,
    order: 0,
    comment: undefined,
    sets: [
      {
        id: `${exerciseId}-set-1`,
        weight: 100,
        weightUnit: 'kg',
        reps: 5,
      },
    ],
    ...overrides,
  }
}

export function createWorkout(overrides: Partial<Workout> = {}): Workout {
  return {
    id: overrides.id ?? `workout-${Math.random().toString(16).slice(2)}`,
    name: overrides.name ?? 'Workout',
    date: overrides.date ?? '2026-04-20',
    exercises: overrides.exercises ?? [createWorkoutExercise('exercise-bench')],
    isCompleted: overrides.isCompleted ?? false,
    completedAt: overrides.completedAt,
    createdAt: overrides.createdAt ?? '2026-04-20T00:00:00.000Z',
    updatedAt: overrides.updatedAt ?? '2026-04-20T00:00:00.000Z',
  }
}

export const completedBenchWorkout = createWorkout({
  id: 'workout-completed-1',
  name: 'Push Day',
  date: '2026-04-20',
  isCompleted: true,
  completedAt: '2026-04-20T10:00:00.000Z',
  exercises: [
    createWorkoutExercise('exercise-bench', {
      comment: 'Felt strong',
      sets: [
        {
          id: 'bench-set-1',
          weight: 100,
          weightUnit: 'kg',
          reps: 5,
        },
        {
          id: 'bench-set-2',
          weight: 102.5,
          weightUnit: 'kg',
          reps: 4,
        },
      ],
    }),
  ],
})

export const completedRowWorkout = createWorkout({
  id: 'workout-completed-2',
  name: 'Pull Day',
  date: '2026-04-22',
  isCompleted: true,
  completedAt: '2026-04-22T10:00:00.000Z',
  exercises: [
    createWorkoutExercise('exercise-row', {
      comment: 'Controlled tempo',
      sets: [
        {
          id: 'row-set-1',
          weight: 80,
          weightUnit: 'kg',
          reps: 8,
        },
      ],
    }),
    createWorkoutExercise('exercise-bench', {
      order: 1,
      sets: [
        {
          id: 'bench-set-3',
          weight: 105,
          weightUnit: 'kg',
          reps: 3,
        },
      ],
    }),
  ],
})

export const upcomingWorkout = createWorkout({
  id: 'workout-upcoming',
  name: 'Leg Day',
  date: '2026-04-26',
  exercises: [
    createWorkoutExercise('exercise-plank', {
      sets: [
        {
          id: 'plank-set-1',
          weight: 0,
          weightUnit: 'kg',
          reps: 60,
        },
      ],
    }),
  ],
})

export function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}
