import { expect, test } from '@playwright/test'
import {
  buildExercise,
  buildSet,
  buildWorkout,
  buildWorkoutExercise,
  seedAppStorage,
} from './helpers/storage'

test.use({ timezoneId: 'UTC' })

function completedWorkout(id: string, completedAt: string) {
  return buildWorkout({
    id,
    name: `Workout ${id}`,
    date: completedAt.slice(0, 10),
    status: 'completed',
    completedAt,
    exercises: [
      buildWorkoutExercise('calendar-bench', 0, [buildSet(`${id}-set`, 70, 8)]),
    ],
  })
}

test('dashboard calendar marks trained days, rest days and today', async ({
  page,
}) => {
  await page.clock.setFixedTime(new Date('2026-10-07T12:00:00.000Z'))

  await seedAppStorage(page, {
    exercises: [
      buildExercise({
        id: 'calendar-bench',
        name: 'Bench Press',
        muscleGroups: ['Chest'],
        isCustom: false,
      }),
    ],
    workouts: [
      completedWorkout('a', '2026-10-05T10:00:00.000Z'),
      completedWorkout('b', '2026-10-05T18:00:00.000Z'),
      completedWorkout('c', '2026-10-06T10:00:00.000Z'),
      buildWorkout({
        id: 'planned',
        name: 'Planned Workout',
        date: '2026-10-04',
        status: 'planned',
        exercises: [],
      }),
    ],
    settings: { defaultWeightUnit: 'kg' },
  })

  await page.goto('')

  await expect(
    page.getByRole('heading', { name: 'Last 30 days' }),
  ).toBeVisible()
  await expect(
    page.getByRole('img', { name: 'Mon 5 Oct: 2 workouts' }),
  ).toBeVisible()
  await expect(
    page.getByRole('img', { name: 'Mon 5 Oct: 2 workouts' }).locator('span'),
  ).toHaveText('2')
  await expect(
    page.getByRole('img', { name: 'Tue 6 Oct: 1 workout' }),
  ).toBeVisible()
  await expect(
    page.getByRole('img', { name: 'Tue 6 Oct: 1 workout' }).locator('span'),
  ).toHaveCount(0)
  await expect(
    page.getByRole('img', { name: 'Sun 4 Oct: rest day' }),
  ).toBeVisible()
  await expect(
    page.getByRole('img', { name: 'Wed 7 Oct: rest day' }),
  ).toHaveAttribute('aria-current', 'date')
  await expect(
    page.getByRole('img', { name: 'Tue 8 Sep: rest day' }),
  ).toBeVisible()
  await expect(page.getByRole('img', { name: /Mon 7 Sep/ })).toHaveCount(0)
  await expect(page.getByRole('img', { name: /Thu 8 Oct/ })).toHaveCount(0)

  const hasHorizontalScroll = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  )
  expect(hasHorizontalScroll).toBe(false)
})

test('dashboard calendar moves today and shifts the window at local midnight', async ({
  page,
}) => {
  await page.clock.install({ time: new Date('2026-10-07T23:59:30.000Z') })

  await seedAppStorage(page, {
    exercises: [],
    workouts: [],
    settings: { defaultWeightUnit: 'kg' },
  })

  await page.goto('')

  await expect(
    page.getByRole('img', { name: 'Wed 7 Oct: rest day' }),
  ).toHaveAttribute('aria-current', 'date')
  await expect(
    page.getByRole('img', { name: 'Tue 8 Sep: rest day' }),
  ).toBeVisible()

  await page.clock.fastForward(60_000)

  await expect(
    page.getByRole('img', { name: 'Thu 8 Oct: rest day' }),
  ).toHaveAttribute('aria-current', 'date')
  await expect(
    page.getByRole('img', { name: 'Wed 7 Oct: rest day' }),
  ).not.toHaveAttribute('aria-current', 'date')
  await expect(page.getByRole('img', { name: /Tue 8 Sep/ })).toHaveCount(0)
})

test.describe('in a non-UTC timezone', () => {
  test.use({ timezoneId: 'America/Los_Angeles' })

  test('dashboard calendar places a late-evening workout on its local day', async ({
    page,
  }) => {
    await page.clock.setFixedTime(new Date('2026-10-07T19:00:00.000Z'))

    await seedAppStorage(page, {
      exercises: [
        buildExercise({
          id: 'calendar-bench',
          name: 'Bench Press',
          muscleGroups: ['Chest'],
          isCustom: false,
        }),
      ],
      // 23:30 on Mon 5 Oct in Los Angeles, which is already Tue 6 Oct in UTC.
      workouts: [completedWorkout('late', '2026-10-06T06:30:00.000Z')],
      settings: { defaultWeightUnit: 'kg' },
    })

    await page.goto('')

    await expect(
      page.getByRole('img', { name: 'Mon 5 Oct: 1 workout' }),
    ).toBeVisible()
    await expect(
      page.getByRole('img', { name: 'Tue 6 Oct: rest day' }),
    ).toBeVisible()
  })
})

test.describe('on a 375px phone', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('dashboard calendar fits without horizontal scroll', async ({
    page,
  }) => {
    await page.clock.setFixedTime(new Date('2026-10-07T12:00:00.000Z'))

    await seedAppStorage(page, {
      exercises: [
        buildExercise({
          id: 'calendar-bench',
          name: 'Bench Press',
          muscleGroups: ['Chest'],
          isCustom: false,
        }),
      ],
      workouts: [
        completedWorkout('a', '2026-10-05T10:00:00.000Z'),
        completedWorkout('b', '2026-10-05T18:00:00.000Z'),
      ],
      settings: { defaultWeightUnit: 'kg' },
    })

    await page.goto('')

    await expect(
      page.getByRole('img', { name: 'Mon 5 Oct: 2 workouts' }),
    ).toBeVisible()

    const hasHorizontalScroll = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    )
    expect(hasHorizontalScroll).toBe(false)
  })
})
