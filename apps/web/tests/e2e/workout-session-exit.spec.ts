import { expect, test } from '@playwright/test'
import {
  buildExercise,
  buildSet,
  buildWorkout,
  buildWorkoutExercise,
  seedAppStorage,
} from './helpers/storage'
import type { Page } from '@playwright/test'

const workoutExerciseCard = (page: Page, name: string) =>
  page.locator(
    `xpath=//h3[normalize-space()='${name}']/ancestor::div[contains(@class,'p-4')][1]`,
  )

test('workout session autosaves changes across continue and exit flows', async ({
  page,
}) => {
  await seedAppStorage(page, {
    exercises: [
      buildExercise({
        id: 'session-exit-bench',
        name: 'Bench Press',
        muscleGroups: ['Chest'],
        isCustom: false,
      }),
    ],
    workouts: [
      buildWorkout({
        id: 'session-exit-workout',
        name: 'Session Exit Workout',
        date: '2026-03-14',
        status: 'planned',
        exercises: [
          buildWorkoutExercise('session-exit-bench', 0, [
            buildSet('session-exit-set-1', 50, 8),
          ]),
        ],
      }),
    ],
    settings: { defaultWeightUnit: 'kg' },
  })

  await page.goto('/workouts/session-exit-workout/session')
  await expect(
    page.getByRole('heading', { name: 'Session Exit Workout' }),
  ).toBeVisible()

  const benchCard = workoutExerciseCard(page, 'Bench Press')
  await benchCard.getByRole('button', { name: 'Add Set' }).click()
  await benchCard.getByPlaceholder('Weight').nth(1).fill('55')
  await benchCard.getByPlaceholder('Reps').nth(1).fill('8')

  await benchCard.getByRole('button', { name: 'Remove set 1' }).click()

  await expect(benchCard.getByPlaceholder('Weight')).toHaveCount(1)
  await expect(benchCard.getByPlaceholder('Weight').first()).toHaveValue('55')
  await expect(benchCard.getByPlaceholder('Reps').first()).toHaveValue('8')

  await page.getByRole('button', { name: 'Exit' }).click()
  await expect(
    page.getByRole('heading', { name: 'Exit Workout?' }),
  ).toBeVisible()
  const continueFromExitButton = page
    .getByRole('button', { name: 'Continue Workout' })
    .last()
  const exitFromDialogButton = page.getByRole('button', { name: 'Exit' }).last()

  await expect(continueFromExitButton).not.toHaveClass(/border-input/)
  await expect(exitFromDialogButton).toHaveClass(/border-input/)

  const desktopContinuePosition = await continueFromExitButton.boundingBox()
  const desktopExitPosition = await exitFromDialogButton.boundingBox()
  expect(desktopContinuePosition?.x).toBeLessThan(desktopExitPosition?.x ?? 0)

  await page.setViewportSize({ width: 390, height: 844 })
  const mobileContinuePosition = await continueFromExitButton.boundingBox()
  const mobileExitPosition = await exitFromDialogButton.boundingBox()
  expect(mobileExitPosition?.y).toBeLessThan(mobileContinuePosition?.y ?? 0)

  await continueFromExitButton.click()
  await expect(
    page.getByRole('heading', { name: 'Exit Workout?' }),
  ).toHaveCount(0)
  await expect(page).toHaveURL(/\/workouts\/session-exit-workout\/session$/)

  await page.getByRole('button', { name: 'Finish Workout' }).first().click()
  await expect(
    page.getByRole('heading', { name: 'Finish Workout?' }),
  ).toBeVisible()

  const continueFromFinishButton = page
    .getByRole('button', { name: 'Continue Workout' })
    .last()
  const finishFromDialogButton = page
    .getByRole('button', { name: 'Finish Workout' })
    .last()

  await expect(continueFromFinishButton).not.toHaveClass(/border-input/)
  await expect(finishFromDialogButton).toHaveClass(/border-input/)

  const mobileFinishPosition = await finishFromDialogButton.boundingBox()
  const mobileContinueFromFinishPosition =
    await continueFromFinishButton.boundingBox()
  expect(mobileFinishPosition?.y).toBeLessThan(
    mobileContinueFromFinishPosition?.y ?? 0,
  )

  await page.setViewportSize({ width: 1280, height: 720 })
  const desktopContinueFromFinishPosition =
    await continueFromFinishButton.boundingBox()
  const desktopFinishPosition = await finishFromDialogButton.boundingBox()
  expect(desktopContinueFromFinishPosition?.x).toBeLessThan(
    desktopFinishPosition?.x ?? 0,
  )

  await continueFromFinishButton.click()
  await expect(
    page.getByRole('heading', { name: 'Finish Workout?' }),
  ).toHaveCount(0)

  await page.getByRole('button', { name: 'Exit' }).click()
  await page.getByRole('button', { name: 'Exit' }).last().click()

  await expect(page).toHaveURL(/\/workouts$/)
  await expect(page.getByRole('heading', { name: 'Workouts' })).toBeVisible()

  await page.getByRole('button', { name: 'Start Workout' }).click()
  await expect(page).toHaveURL(/\/workouts\/session-exit-workout\/session$/)

  await expect(benchCard.getByPlaceholder('Weight').first()).toHaveValue('55')
  await expect(benchCard.getByPlaceholder('Reps').first()).toHaveValue('8')

  await expect
    .poll(async () => {
      return page.evaluate(() => {
        const workouts = JSON.parse(
          localStorage.getItem('fitness-app-workouts') || '[]',
        )
        const workout = workouts.find(
          (entry: { id: string }) => entry.id === 'session-exit-workout',
        )
        return workout?.exercises?.[0]?.sets ?? []
      })
    })
    .toEqual([
      { id: expect.any(String), weight: 55, weightUnit: 'kg', reps: 8 },
    ])
})

test('workout session can delete an exercise from the active workout', async ({
  page,
}) => {
  await seedAppStorage(page, {
    exercises: [
      buildExercise({
        id: 'session-delete-bench',
        name: 'Bench Press',
        muscleGroups: ['Chest'],
        isCustom: false,
      }),
      buildExercise({
        id: 'session-delete-row',
        name: 'Row',
        muscleGroups: ['Back'],
        isCustom: false,
      }),
    ],
    workouts: [
      buildWorkout({
        id: 'session-delete-workout',
        name: 'Session Delete Workout',
        date: '2026-03-15',
        status: 'planned',
        exercises: [
          buildWorkoutExercise('session-delete-bench', 0, [
            buildSet('session-delete-set-1', 60, 8),
          ]),
          buildWorkoutExercise('session-delete-row', 1, [
            buildSet('session-delete-set-2', 45, 10),
          ]),
        ],
      }),
    ],
    settings: { defaultWeightUnit: 'kg' },
  })

  await page.goto('/workouts/session-delete-workout/session')
  await expect(
    page.getByRole('heading', { name: 'Session Delete Workout' }),
  ).toBeVisible()

  await workoutExerciseCard(page, 'Bench Press')
    .getByRole('button')
    .nth(2)
    .click()
  await page.getByRole('menuitem', { name: 'Delete Exercise' }).click()

  await expect(workoutExerciseCard(page, 'Bench Press')).toHaveCount(0)
  await expect(workoutExerciseCard(page, 'Row')).toBeVisible()

  await expect
    .poll(async () => {
      return page.evaluate(() => {
        const workouts = JSON.parse(
          localStorage.getItem('fitness-app-workouts') || '[]',
        )
        const workout = workouts.find(
          (entry: { id: string }) => entry.id === 'session-delete-workout',
        )
        return workout?.exercises?.map(
          (exercise: { exerciseId: string; order: number }) => ({
            exerciseId: exercise.exerciseId,
            order: exercise.order,
          }),
        )
      })
    })
    .toEqual([{ exerciseId: 'session-delete-row', order: 0 }])
})
