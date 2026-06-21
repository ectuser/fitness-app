import { expect, test } from '@playwright/test'
import {
  buildExercise,
  buildSet,
  buildWorkout,
  buildWorkoutExercise,
  seedAppStorage,
} from './helpers/storage'

test('dashboard shows next workout, coming workouts, show all, and start workout entrypoints', async ({
  page,
}) => {
  await page.clock.setFixedTime(new Date('2026-05-04T12:00:00.000Z'))

  await seedAppStorage(page, {
    exercises: [
      buildExercise({
        id: 'dashboard-overview-bench',
        name: 'Bench Press',
        muscleGroups: ['Chest'],
        isCustom: false,
      }),
      buildExercise({
        id: 'dashboard-overview-row',
        name: 'Row',
        muscleGroups: ['Back'],
        isCustom: false,
      }),
    ],
    workouts: [
      buildWorkout({
        id: 'dashboard-workout-1',
        name: 'Earliest Workout',
        date: '2026-05-05',
        isCompleted: false,
        exercises: [
          buildWorkoutExercise('dashboard-overview-bench', 0, [
            buildSet('dashboard-set-1', 70, 8),
          ]),
        ],
      }),
      buildWorkout({
        id: 'dashboard-workout-2',
        name: 'Second Workout',
        date: '2026-05-06',
        isCompleted: false,
        exercises: [
          buildWorkoutExercise('dashboard-overview-row', 0, [
            buildSet('dashboard-set-2', 60, 10),
          ]),
        ],
      }),
      buildWorkout({
        id: 'dashboard-workout-3',
        name: 'Third Workout',
        date: '2026-05-07',
        isCompleted: false,
        exercises: [
          buildWorkoutExercise('dashboard-overview-bench', 0, [
            buildSet('dashboard-set-3', 72.5, 8),
          ]),
        ],
      }),
      buildWorkout({
        id: 'dashboard-workout-4',
        name: 'Fourth Workout',
        date: '2026-05-08',
        isCompleted: false,
        exercises: [
          buildWorkoutExercise('dashboard-overview-row', 0, [
            buildSet('dashboard-set-4', 62.5, 10),
          ]),
        ],
      }),
      buildWorkout({
        id: 'dashboard-workout-5',
        name: 'Fifth Workout',
        date: '2026-05-09',
        isCompleted: false,
        exercises: [
          buildWorkoutExercise('dashboard-overview-bench', 0, [
            buildSet('dashboard-set-5', 75, 8),
          ]),
        ],
      }),
    ],
    settings: { defaultWeightUnit: 'kg' },
  })

  await page.goto('')
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()

  await expect(page.getByText('Earliest Workout')).toBeVisible()
  await expect(page.getByText('Second Workout')).toBeVisible()
  await expect(page.getByText('Third Workout')).toBeVisible()
  await expect(page.getByText('Fourth Workout')).toBeVisible()
  await expect(page.getByText('Fifth Workout')).toBeVisible()

  await page.getByRole('button', { name: 'Show All' }).click()
  await expect(page.getByRole('heading', { name: 'Workouts' })).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Earliest Workout' }),
  ).toBeVisible()

  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()

  await page.getByRole('button', { name: 'Start Workout' }).click()
  await expect(page).toHaveURL(/\/workouts\/dashboard-workout-1\/session$/)
  await expect(
    page.getByRole('heading', { name: 'Earliest Workout' }),
  ).toBeVisible()
})
