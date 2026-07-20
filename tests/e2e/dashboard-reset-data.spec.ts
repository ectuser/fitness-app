import { expect, test } from '@playwright/test'
import {
  STORAGE_KEYS,
  buildExercise,
  buildSet,
  buildWorkout,
  buildWorkoutExercise,
  seedAppStorage,
} from './helpers/storage'

test('settings reset data clears workouts and restores seeded exercises', async ({
  page,
}) => {
  await seedAppStorage(page, {
    exercises: [
      buildExercise({
        id: 'exercise-reset-1',
        name: 'Reset Test Exercise',
        muscleGroups: ['Core'],
        isCustom: true,
      }),
    ],
    workouts: [
      buildWorkout({
        id: 'workout-reset-1',
        name: 'Reset Workout',
        date: '2026-03-05',
        status: 'planned',
        exercises: [
          buildWorkoutExercise('exercise-reset-1', 0, [
            buildSet('set-reset-1', 10, 10),
          ]),
        ],
      }),
    ],
    settings: { defaultWeightUnit: 'kg' },
  })

  await page.addInitScript((draftKey) => {
    localStorage.setItem(
      draftKey,
      JSON.stringify({
        name: 'Draft To Be Cleared',
        date: '2026-03-05',
        exercises: [],
        updatedAt: '2026-03-05T10:00:00.000Z',
      }),
    )
  }, STORAGE_KEYS.WORKOUT_CREATE_DRAFT)

  await page.goto('/settings')
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()
  await expect
    .poll(async () => {
      return page.evaluate((draftKey) => {
        return localStorage.getItem(draftKey)
      }, STORAGE_KEYS.WORKOUT_CREATE_DRAFT)
    })
    .not.toBeNull()

  await page.getByRole('button', { name: 'Reset Data' }).click()

  await expect(
    page.getByRole('heading', { name: 'Reset All Data?' }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Reset Data' }).click()

  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()

  await expect
    .poll(async () => {
      return page.evaluate(() => {
        const workouts = JSON.parse(
          localStorage.getItem('fitness-app-workouts') || '[]',
        )
        const exercises = JSON.parse(
          localStorage.getItem('fitness-app-exercises') || '[]',
        )
        return { workouts: workouts.length, exercises: exercises.length }
      })
    })
    .toEqual({ workouts: 0, exercises: 15 })

  await expect
    .poll(async () => {
      return page.evaluate((draftKey) => {
        return localStorage.getItem(draftKey)
      }, STORAGE_KEYS.WORKOUT_CREATE_DRAFT)
    })
    .toBeNull()
})
