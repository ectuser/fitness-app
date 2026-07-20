import { expect, test } from '@playwright/test'
import { clearAppStorage } from './helpers/storage'

test('exercise selector can create a new exercise inline and add it to the workout', async ({
  page,
}) => {
  await clearAppStorage(page)
  await page.goto('/workouts/new')

  await page.getByLabel('Workout Name').fill('Inline Exercise Workout')
  await page.getByRole('button', { name: 'Add Exercise' }).click()
  await expect(
    page.getByRole('heading', { name: 'Add Exercise' }),
  ).toBeVisible()

  await page.getByPlaceholder('Search exercises...').fill('Zottman Curl')
  await expect(page.getByText('No exercises found')).toBeVisible()
  await page.getByRole('button', { name: 'Create New Exercise' }).click()

  const createExerciseDialog = page.getByRole('dialog', {
    name: 'Create New Exercise',
  })
  await expect(createExerciseDialog).toBeVisible()
  await createExerciseDialog
    .getByPlaceholder('e.g., Barbell Rows')
    .fill('Zottman Curl')
  await createExerciseDialog.getByRole('button', { name: 'Biceps' }).click()
  await createExerciseDialog
    .getByPlaceholder('Add notes about form, tips, or variations...')
    .fill('Rotate the wrists on the way down.')
  await createExerciseDialog
    .getByRole('button', { name: 'Save Exercise' })
    .click()

  await expect(
    page.getByRole('heading', { level: 3, name: 'Zottman Curl' }),
  ).toBeVisible()
  await page.getByPlaceholder('Weight').first().fill('14')
  await page.getByPlaceholder('Reps').first().fill('10')
  await page.getByRole('button', { name: 'Create' }).click()

  await expect(page.getByRole('heading', { name: 'Workouts' })).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Inline Exercise Workout' }),
  ).toBeVisible()

  await page.getByRole('link', { name: 'Exercises' }).click()
  await expect(page.getByText('Zottman Curl')).toBeVisible()

  await expect
    .poll(async () => {
      return page.evaluate(() => {
        const exercises = JSON.parse(
          localStorage.getItem('fitness-app-exercises') || '[]',
        )
        const workouts = JSON.parse(
          localStorage.getItem('fitness-app-workouts') || '[]',
        )
        const exercise = exercises.find(
          (entry: { name: string }) => entry.name === 'Zottman Curl',
        )
        const workout = workouts.find(
          (entry: { name: string }) => entry.name === 'Inline Exercise Workout',
        )

        return {
          hasExercise: Boolean(exercise),
          muscleGroups: exercise?.muscleGroups ?? [],
          isCustom: exercise?.isCustom ?? null,
          workoutExerciseId: workout?.exercises?.[0]?.exerciseId ?? null,
        }
      })
    })
    .toEqual({
      hasExercise: true,
      muscleGroups: ['Biceps'],
      isCustom: true,
      workoutExerciseId: expect.any(String),
    })
})
