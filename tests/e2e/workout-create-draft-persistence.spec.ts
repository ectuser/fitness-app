import { expect, test } from '@playwright/test'
import { STORAGE_KEYS, buildExercise, seedAppStorage } from './helpers/storage'
import type { Page } from '@playwright/test'

const workoutExerciseCard = (page: Page, name: string) =>
  page
    .getByRole('heading', { name, exact: true })
    .locator(
      "xpath=ancestor::*[.//input[@placeholder='Weight'] and .//input[@placeholder='Reps'] and .//button[normalize-space()='Details']][1]",
    )

const draftValue = (page: Page) =>
  page.evaluate(
    (draftKey) => localStorage.getItem(draftKey),
    STORAGE_KEYS.WORKOUT_CREATE_DRAFT,
  )

async function seedExercises(page: Page) {
  await seedAppStorage(page, {
    exercises: [
      buildExercise({
        id: 'draft-bench-press',
        name: 'Bench Press',
        muscleGroups: ['Chest', 'Arms'],
        isCustom: false,
      }),
    ],
    workouts: [],
    settings: { defaultWeightUnit: 'kg' },
  })
}

async function addBenchPressExercise(page: Page) {
  await page.getByRole('button', { name: 'Add Exercise' }).click()
  await page.getByRole('heading', { name: 'Bench Press' }).click()
}

test('create workout restores full draft after navigating away and returning', async ({
  page,
}) => {
  await seedExercises(page)
  await page.goto('/workouts/new')

  await page.getByLabel('Workout Name').fill('Draft Restore Workout')
  await page.getByLabel('Date').fill('2026-04-25')
  await addBenchPressExercise(page)

  const benchCard = workoutExerciseCard(page, 'Bench Press')
  await benchCard.getByPlaceholder('Weight').first().fill('82.5')
  await benchCard.getByPlaceholder('Reps').first().fill('7')
  await benchCard.getByRole('button', { name: 'Details' }).click()
  await benchCard.getByLabel('Comment').fill('Top set felt strong')

  await expect.poll(async () => draftValue(page)).not.toBeNull()

  await page.getByRole('link', { name: 'Workouts' }).click()
  await expect(page).toHaveURL(/\/workouts$/)
  await expect(page.getByRole('heading', { name: 'Workouts' })).toBeVisible()

  await page.getByRole('button', { name: 'Create Workout' }).click()
  await expect(page).toHaveURL(/\/workouts\/new$/)

  await expect(page.getByLabel('Workout Name')).toHaveValue(
    'Draft Restore Workout',
  )
  await expect(page.getByLabel('Date')).toHaveValue('2026-04-25')
  await expect(page.getByRole('heading', { name: 'Bench Press' })).toBeVisible()

  const restoredBenchCard = workoutExerciseCard(page, 'Bench Press')
  await expect(
    restoredBenchCard.getByPlaceholder('Weight').first(),
  ).toHaveValue('82.5')
  await expect(restoredBenchCard.getByPlaceholder('Reps').first()).toHaveValue(
    '7',
  )
  await restoredBenchCard.getByRole('button', { name: 'Details' }).click()
  await expect(restoredBenchCard.getByLabel('Comment')).toHaveValue(
    'Top set felt strong',
  )
})

test('create workout clears draft key after successful create', async ({
  page,
}) => {
  await seedExercises(page)
  await page.goto('/workouts/new')

  await page.getByLabel('Workout Name').fill('Draft Cleanup Create')
  await addBenchPressExercise(page)

  await expect.poll(async () => draftValue(page)).not.toBeNull()

  await page.getByRole('button', { name: 'Create Workout' }).click()
  await expect(page.getByRole('heading', { name: 'Workouts' })).toBeVisible()

  await expect.poll(async () => draftValue(page)).toBeNull()
})

test('save and finish workout clears draft key after successful save', async ({
  page,
}) => {
  await seedExercises(page)
  await page.goto('/workouts/new')

  await page.getByLabel('Workout Name').fill('Draft Cleanup Save Finish')
  await addBenchPressExercise(page)

  await expect.poll(async () => draftValue(page)).not.toBeNull()

  await page.getByRole('button', { name: 'Save and Finish Workout' }).click()
  await expect(
    page.getByRole('heading', { name: 'Completed Workouts' }),
  ).toBeVisible()

  await expect.poll(async () => draftValue(page)).toBeNull()
})

test('cancel clears draft key in create workout flow', async ({ page }) => {
  await seedExercises(page)
  await page.goto('/workouts/new')

  await page.getByLabel('Workout Name').fill('Draft Cleanup Cancel')
  await addBenchPressExercise(page)

  await expect.poll(async () => draftValue(page)).not.toBeNull()

  await page.getByRole('button', { name: 'Cancel' }).click()
  await expect(page.getByRole('heading', { name: 'Workouts' })).toBeVisible()

  await expect.poll(async () => draftValue(page)).toBeNull()
})
