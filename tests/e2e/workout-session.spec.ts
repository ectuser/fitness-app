import { test, expect } from '@playwright/test';
import {
  seedAppStorage,
  buildExercise,
  buildWorkout,
  buildWorkoutExercise,
  buildSet,
} from './helpers/storage';

test('workout session add exercise finish and update stats', async ({ page }) => {
  await seedAppStorage(page, {
    exercises: [
      buildExercise({
        id: 'exercise-session-bench',
        name: 'Bench Press',
        muscleGroups: ['Chest', 'Arms'],
        isCustom: false,
      }),
      buildExercise({
        id: 'exercise-session-pushups',
        name: 'Push-ups',
        muscleGroups: ['Chest', 'Arms', 'Core'],
        isCustom: false,
      }),
    ],
    workouts: [
      buildWorkout({
        id: 'workout-session-1',
        name: 'Session Day',
        date: '2026-03-04',
        isCompleted: false,
        exercises: [
          buildWorkoutExercise('exercise-session-bench', 0, [
            buildSet('set-session-bench-1', 0, 0),
          ]),
        ],
      }),
    ],
    settings: { defaultWeightUnit: 'kg' },
  });

  await page.goto('/workouts/workout-session-1/session');
  await expect(page.getByRole('heading', { name: 'Session Day' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Bench Press' })).toBeVisible();
  await page.getByPlaceholder('Weight').first().fill('6,5');
  await page.getByPlaceholder('Reps').first().fill('8');

  await expect.poll(async () => {
    return page.evaluate(() => {
      const workouts = JSON.parse(localStorage.getItem('fitness-app-workouts') || '[]');
      const workout = workouts.find((w: { id: string }) => w.id === 'workout-session-1');
      return workout?.exercises?.[0]?.sets?.[0]?.weight ?? null;
    });
  }).toBe(6.5);

  await page.getByRole('button', { name: 'Add Exercise' }).click();
  await expect(page.getByRole('heading', { name: 'Add Exercise' })).toBeVisible();
  await page.getByRole('heading', { name: 'Push-ups' }).click();
  await expect(page.getByRole('heading', { level: 3, name: 'Push-ups' })).toBeVisible();

  await page.getByPlaceholder('Weight').nth(1).fill('42');
  await page.getByPlaceholder('Reps').nth(1).fill('12');

  await page.getByRole('button', { name: 'Finish Workout' }).first().click();
  await page
    .getByRole('alertdialog', { name: 'Finish Workout?' })
    .getByRole('button', { name: 'Finish Workout' })
    .click();

  await expect(page.getByRole('heading', { name: 'Workouts' })).toBeVisible();
  await page.getByRole('link', { name: 'Exercises' }).click();
  await page.getByText('Bench Press').first().click();

  await expect(page.getByRole('heading', { level: 1, name: 'Bench Press' })).toBeVisible();
  await expect(page.getByText('6.5 kg', { exact: true })).toBeVisible();
  await expect(page.getByText('Total Sets')).toBeVisible();
  await expect(page.getByText('1', { exact: true })).toBeVisible();
});
