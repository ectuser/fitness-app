import { expect, test } from '@playwright/test'
import {
  buildExercise,
  buildSet,
  buildWorkout,
  buildWorkoutExercise,
  clearAppStorage,
  seedAppStorage,
} from './helpers/storage'

test('save and finish creates completed workout from create page', async ({
  page,
}) => {
  await clearAppStorage(page)
  await page.goto('workouts/new')

  await page.getByLabel('Workout Name').fill('Finish From Create')
  await page.getByRole('button', { name: 'Add Exercise' }).click()
  await page.getByRole('heading', { name: 'Bench Press' }).click()

  await page.getByRole('button', { name: 'More actions' }).click()
  await page.getByRole('menuitem', { name: 'Create and Finish' }).click()

  await expect(
    page.getByRole('heading', { name: 'Completed Workouts' }),
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Finish From Create' }),
  ).toBeVisible()

  await expect
    .poll(async () => {
      return page.evaluate(() => {
        const workouts = JSON.parse(
          localStorage.getItem('fitness-app-workouts') || '[]',
        )
        const workout = workouts.find(
          (w: { name: string }) => w.name === 'Finish From Create',
        )
        if (!workout) return null
        return {
          status: workout.status,
          hasCompletedAt: Boolean(workout.completedAt),
        }
      })
    })
    .toEqual({ status: 'completed', hasCompletedAt: true })
})

test('start creates a workout and opens its session', async ({ page }) => {
  await clearAppStorage(page)
  await page.goto('workouts/new')

  await page.getByLabel('Workout Name').fill('Start From Create')
  await page.getByRole('button', { name: 'Add Exercise' }).click()
  await page.getByRole('heading', { name: 'Bench Press' }).click()

  await page.getByRole('button', { name: 'More actions' }).click()
  await page.getByRole('menuitem', { name: 'Create and Start' }).click()

  await expect(page).toHaveURL(/\/workouts\/[^/]+\/session$/)
  await expect(
    page.getByRole('heading', { name: 'Start From Create' }),
  ).toBeVisible()

  await expect
    .poll(async () => {
      return page.evaluate(() => {
        const workouts = JSON.parse(
          localStorage.getItem('fitness-app-workouts') || '[]',
        )
        const workout = workouts.find(
          (w: { name: string }) => w.name === 'Start From Create',
        )
        return workout?.status
      })
    })
    .toBe('in_progress')
})

test('save and finish updates existing workout from edit page', async ({
  page,
}) => {
  await seedAppStorage(page, {
    exercises: [
      buildExercise({
        id: 'save-finish-bench',
        name: 'Bench Press',
        muscleGroups: ['Chest', 'Arms (Legacy)'],
        isCustom: false,
      }),
    ],
    workouts: [
      buildWorkout({
        id: 'save-finish-workout',
        name: 'Finish From Edit',
        date: '2026-03-06',
        status: 'planned',
        exercises: [
          buildWorkoutExercise('save-finish-bench', 0, [
            buildSet('save-finish-set-1', 60, 10),
          ]),
        ],
      }),
    ],
    settings: { defaultWeightUnit: 'kg' },
  })

  await page.goto('/workouts/save-finish-workout/edit')
  await expect(
    page.getByRole('heading', { name: 'Edit Workout' }),
  ).toBeVisible()

  await page.getByLabel('Workout Name').fill('Finish From Edit Updated')
  await page.getByRole('button', { name: 'Save and Finish Workout' }).click()

  await expect(
    page.getByRole('heading', { name: 'Completed Workouts' }),
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Finish From Edit Updated' }),
  ).toBeVisible()

  await expect
    .poll(async () => {
      return page.evaluate(() => {
        const workouts = JSON.parse(
          localStorage.getItem('fitness-app-workouts') || '[]',
        )
        const workout = workouts.find(
          (w: { id: string }) => w.id === 'save-finish-workout',
        )
        if (!workout) return null
        return {
          name: workout.name,
          status: workout.status,
          hasCompletedAt: Boolean(workout.completedAt),
        }
      })
    })
    .toEqual({
      name: 'Finish From Edit Updated',
      status: 'completed',
      hasCompletedAt: true,
    })
})
