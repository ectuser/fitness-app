import { expect, test } from '@playwright/test'
import {
  buildExercise,
  buildSet,
  buildWorkout,
  buildWorkoutExercise,
  seedAppStorage,
} from './helpers/storage'
import type { Page } from '@playwright/test'

const benchPress = buildExercise({
  id: 'bench-press',
  name: 'Bench Press',
  muscleGroups: ['Chest', 'Triceps'],
  comments: 'Keep your shoulders retracted.',
})

const activeWorkout = buildWorkout({
  id: 'active-workout',
  name: 'Upper Body',
  date: '2026-07-20',
  isCompleted: false,
  exercises: [
    buildWorkoutExercise('bench-press', 0, [buildSet('set-1', 80, 8)]),
  ],
})

async function seedDarkTheme(page: Page) {
  await seedAppStorage(page, {
    exercises: [benchPress],
    workouts: [activeWorkout],
    settings: { defaultWeightUnit: 'kg', themeMode: 'dark' },
  })
}

test.describe('dark theme visual regression coverage', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    await seedDarkTheme(page)
  })

  test('renders an active workout session without light surfaces', async ({
    page,
  }) => {
    await page.goto('/workouts/active-workout/session')
    await expect(page.getByText('Workout in Progress')).toBeVisible({
      timeout: 15_000,
    })

    await expect(page).toHaveScreenshot('dark-workout-session.png', {
      animations: 'disabled',
      fullPage: true,
    })
  })

  test('renders exercise selection in a dark modal', async ({ page }) => {
    await page.goto('/workouts/new')
    await page.getByRole('button', { name: 'Add Exercise' }).click()
    await expect(
      page.getByRole('dialog', { name: 'Add Exercise' }),
    ).toBeVisible()

    await expect(page).toHaveScreenshot('dark-exercise-selector.png', {
      animations: 'disabled',
      fullPage: true,
    })
  })

  test('renders exercise form validation in dark mode', async ({ page }) => {
    await page.goto('/exercises/new')
    await page.getByRole('button', { name: 'Save Exercise' }).click()
    await expect(page.getByText('Exercise name is required')).toBeVisible()

    await expect(page).toHaveScreenshot('dark-exercise-form-error.png', {
      animations: 'disabled',
      fullPage: true,
    })
  })
})
