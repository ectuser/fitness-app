import { test, expect } from '@playwright/test';
import {
  clearAppStorage,
  seedAppStorage,
  buildExercise,
  buildWorkout,
  buildWorkoutExercise,
  buildSet,
} from './helpers/storage';

test('exercise create and edit custom flow', async ({ page }) => {
  await clearAppStorage(page);
  await page.goto('exercises');

  await page.getByRole('button', { name: 'New' }).click();
  await expect(page.getByRole('heading', { name: 'Create Exercise' })).toBeVisible();

  await page.getByLabel('Exercise Name').fill('Cable Row');
  await page.getByRole('button', { name: 'Back' }).click();
  await page.getByRole('button', { name: 'Biceps' }).click();
  await page.getByLabel('Comments (Optional)').fill('Keep torso stable.');
  await page.getByRole('button', { name: 'Save Exercise' }).click();

  await expect(page.getByRole('heading', { name: 'Exercises' })).toBeVisible();
  await expect(page.getByText('Cable Row')).toBeVisible();

  await expect.poll(async () => {
    return page.evaluate(() => {
      const raw = localStorage.getItem('fitness-app-exercises');
      if (!raw) return false;
      const exercises = JSON.parse(raw) as Array<{ name: string }>;
      return exercises.some((exercise) => exercise.name === 'Cable Row');
    });
  }).toBe(true);

  await page.getByText('Cable Row').first().click();

  await expect(page.getByRole('heading', { level: 1, name: 'Cable Row' })).toBeVisible();
  await page.getByRole('button').nth(1).click();
  await expect(page.getByRole('heading', { name: 'Edit Exercise' })).toBeVisible();

  await page.getByLabel('Exercise Name').fill('Cable Row Wide Grip');
  await page.getByRole('button', { name: 'Save Exercise' }).click();

  await expect(page.getByRole('heading', { name: 'Exercises' })).toBeVisible();
  await expect(page.getByText('Cable Row Wide Grip')).toBeVisible();
});

test('exercise delete unused custom succeeds', async ({ page }) => {
  await seedAppStorage(page, {
    exercises: [
      buildExercise({
        id: 'exercise-custom-1',
        name: 'Custom Pulldown',
        muscleGroups: ['Back'],
        isCustom: true,
      }),
    ],
    workouts: [],
    settings: { defaultWeightUnit: 'kg' },
  });

  await page.goto('exercises');
  await page.getByText('Custom Pulldown').first().click();
  await expect(page.getByRole('heading', { level: 1, name: 'Custom Pulldown' })).toBeVisible();

  await page.getByRole('button').nth(2).click();
  await expect(page.getByRole('heading', { name: 'Delete Exercise?' })).toBeVisible();
  await page.getByRole('button', { name: 'Delete' }).click();

  await expect(page.getByRole('heading', { name: 'Exercises' })).toBeVisible();
  await expect(page.getByText('Custom Pulldown')).toHaveCount(0);
});

test('exercise delete used in workouts shows guard error', async ({ page }) => {
  await seedAppStorage(page, {
    exercises: [
      buildExercise({
        id: 'exercise-custom-guard',
        name: 'Protected Curl',
        muscleGroups: ['Arms'],
        isCustom: true,
      }),
    ],
    workouts: [
      buildWorkout({
        id: 'workout-guard',
        name: 'Guard Workout',
        date: '2026-03-01',
        isCompleted: false,
        exercises: [
          buildWorkoutExercise('exercise-custom-guard', 0, [
            buildSet('set-guard-1', 20, 10),
          ]),
        ],
      }),
    ],
    settings: { defaultWeightUnit: 'kg' },
  });

  await page.goto('exercises');
  await page.getByText('Protected Curl').first().click();
  await expect(page.getByRole('heading', { level: 1, name: 'Protected Curl' })).toBeVisible();

  await page.getByRole('button').nth(2).click();
  await expect(page.getByRole('heading', { name: 'Delete Exercise?' })).toBeVisible();

  let dialogMessage = '';
  page.once('dialog', async (dialog) => {
    dialogMessage = dialog.message();
    await dialog.accept();
  });
  await page.getByRole('button', { name: 'Delete' }).click();
  await expect.poll(() => dialogMessage).toContain(
    'Cannot delete exercise that is used in workouts'
  );

  await expect(page.getByRole('heading', { level: 1, name: 'Protected Curl' })).toBeVisible();
});
