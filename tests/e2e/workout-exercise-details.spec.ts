import { expect, test } from '@playwright/test'
import {
  buildExercise,
  buildSet,
  buildWorkout,
  buildWorkoutExercise,
  seedAppStorage,
} from './helpers/storage'

test('workout exercise details shows stats and allows editing comment', async ({
  page,
}) => {
  await seedAppStorage(page, {
    exercises: [
      buildExercise({
        id: 'exercise-details-bench',
        name: 'Bench Press',
        muscleGroups: ['Chest', 'Arms'],
        comments: 'Keep scapula tight',
        isCustom: false,
      }),
    ],
    workouts: [
      buildWorkout({
        id: 'workout-details-completed',
        name: 'Completed Day',
        date: '2026-03-01',
        status: 'completed',
        completedAt: '2026-03-01T12:00:00.000Z',
        exercises: [
          buildWorkoutExercise('exercise-details-bench', 0, [
            buildSet('set-details-completed-1', 95, 6),
          ]),
        ],
      }),
      buildWorkout({
        id: 'workout-details-active',
        name: 'Current Day',
        date: '2026-03-04',
        status: 'planned',
        exercises: [
          buildWorkoutExercise('exercise-details-bench', 0, [
            buildSet('set-details-active-1', 70, 10),
          ]),
        ],
      }),
    ],
    settings: { defaultWeightUnit: 'kg' },
  })

  await page.goto('/workouts/workout-details-active/session')
  await expect(page.getByRole('heading', { name: 'Bench Press' })).toBeVisible()

  await page.getByRole('button', { name: 'Details' }).click()

  await expect(page.getByText('Max:')).toBeVisible()
  await expect(page.getByText('Last:')).toBeVisible()
  await expect(page.locator('span', { hasText: '95 kg × 6' })).toHaveCount(2)

  const commentInput = page.getByLabel('Comment')
  await expect(commentInput).toHaveValue('Keep scapula tight')

  const updatedComment = 'Keep elbows under the bar'
  await commentInput.fill(updatedComment)

  await expect
    .poll(async () => {
      return page.evaluate(() => {
        const workouts = JSON.parse(
          localStorage.getItem('fitness-app-workouts') || '[]',
        )
        const workout = workouts.find(
          (w: { id: string }) => w.id === 'workout-details-active',
        )
        return workout?.exercises?.[0]?.comment ?? null
      })
    })
    .toBe(updatedComment)

  await expect(commentInput).toHaveValue(updatedComment)
})

test('workout exercise details comment stays editable without exercise stats', async ({
  page,
}) => {
  await seedAppStorage(page, {
    exercises: [
      buildExercise({
        id: 'exercise-details-no-stats',
        name: 'Front Squat',
        muscleGroups: ['Quads', 'Core'],
        isCustom: false,
      }),
    ],
    workouts: [
      buildWorkout({
        id: 'workout-details-no-stats',
        name: 'No Stats Day',
        date: '2026-03-04',
        status: 'planned',
        exercises: [
          buildWorkoutExercise('exercise-details-no-stats', 0, [
            buildSet('set-details-no-stats-1', 0, 0),
          ]),
        ],
      }),
    ],
    settings: { defaultWeightUnit: 'kg' },
  })

  await page.goto('/workouts/workout-details-no-stats/session')
  await page.getByRole('button', { name: 'Details' }).click()

  await expect(page.getByText('Max:')).toHaveCount(0)
  await expect(page.getByText('Last:')).toHaveCount(0)

  const commentInput = page.getByLabel('Comment')
  const comment = 'Stay upright through the full range'
  await commentInput.fill(comment)

  await expect
    .poll(async () => {
      return page.evaluate(() => {
        const workouts = JSON.parse(
          localStorage.getItem('fitness-app-workouts') || '[]',
        )
        const workout = workouts.find(
          (w: { id: string }) => w.id === 'workout-details-no-stats',
        )
        return workout?.exercises?.[0]?.comment ?? null
      })
    })
    .toBe(comment)
})
