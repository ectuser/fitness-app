import { expect, test } from '@playwright/test'
import { clearAppStorage } from './helpers/storage'

test('exercise form validates required fields before saving', async ({
  page,
}) => {
  await clearAppStorage(page)
  await page.goto('/exercises/new')

  await expect(
    page.getByRole('heading', { name: 'Create Exercise' }),
  ).toBeVisible()

  await page.getByRole('button', { name: 'Save Exercise' }).click()
  await expect(page.getByText('Exercise name is required')).toBeVisible()

  await page.getByLabel('Exercise Name').fill('Validation Curl')
  await page.getByRole('button', { name: 'Save Exercise' }).click()
  await expect(
    page.getByText('Please select at least one muscle group'),
  ).toBeVisible()
  await expect(page).toHaveURL(/\/exercises\/new$/)

  await expect
    .poll(async () => {
      return page.evaluate(() => {
        const exercises = JSON.parse(
          localStorage.getItem('fitness-app-exercises') || '[]',
        )
        return exercises.some(
          (exercise: { name: string }) => exercise.name === 'Validation Curl',
        )
      })
    })
    .toBe(false)
})

test('workout form validates required fields before saving', async ({
  page,
}) => {
  await clearAppStorage(page)
  await page.goto('/workouts/new')

  await expect(
    page.getByRole('heading', { name: 'Create Workout' }),
  ).toBeVisible()

  await page.getByLabel('Workout Name').fill('   ')
  await page.getByRole('button', { name: 'Create' }).click()

  await expect(page.getByText('Workout name is required')).toBeVisible()
  await expect(page.getByText('Add at least one exercise')).toBeVisible()
  await expect(page).toHaveURL(/\/workouts\/new$/)

  await expect
    .poll(async () => {
      return page.evaluate(() => {
        const workouts = JSON.parse(
          localStorage.getItem('fitness-app-workouts') || '[]',
        )
        return workouts.length
      })
    })
    .toBe(0)
})

test('missing exercise detail route falls back to the exercises list', async ({
  page,
}) => {
  await clearAppStorage(page)
  await page.goto('/exercises/not-a-real-exercise')

  await expect(
    page.getByRole('heading', { name: 'Exercise Not Found' }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Back to Exercises' }).click()

  await expect(page).toHaveURL(/\/exercises$/)
  await expect(page.getByRole('heading', { name: 'Exercises' })).toBeVisible()
})

test('missing workout session route falls back to the workouts list', async ({
  page,
}) => {
  await clearAppStorage(page)
  await page.goto('/workouts/not-a-real-workout/session')

  await expect(
    page.getByRole('heading', { name: 'Workout Not Found' }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Back to Workouts' }).click()

  await expect(page).toHaveURL(/\/workouts$/)
  await expect(page.getByRole('heading', { name: 'Workouts' })).toBeVisible()
})
