import { test, expect } from '@playwright/test';
import {
  clearAppStorage,
  seedAppStorage,
  buildExercise,
  buildWorkout,
  buildWorkoutExercise,
  buildSet,
} from './helpers/storage';

test('exercise selector supports muscle filter with clear active indication and reset', async ({ page }) => {
  await clearAppStorage(page);
  await page.goto('workouts/new');

  await page.getByRole('button', { name: 'Add Exercise' }).click();
  await expect(page.getByRole('heading', { name: 'Add Exercise' })).toBeVisible();

  await page.getByRole('combobox').first().click();
  await page.getByRole('option', { name: 'Chest' }).click();

  await expect(page.getByText('Filtering by Chest')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Bench Press' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Pull-ups' })).toHaveCount(0);

  await page.getByRole('button', { name: 'Reset Filter' }).click();
  await expect(page.getByText('Filtering by Chest')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Pull-ups' })).toBeVisible();
});

test('switch exercise opens selector with preselected muscle filter', async ({ page }) => {
  await seedAppStorage(page, {
    exercises: [
      buildExercise({
        id: 'switch-filter-bench',
        name: 'Bench Press',
        muscleGroups: ['Chest', 'Arms (Legacy)'],
        isCustom: false,
      }),
      buildExercise({
        id: 'switch-filter-pushups',
        name: 'Push-ups',
        muscleGroups: ['Chest', 'Arms (Legacy)', 'Core'],
        isCustom: false,
      }),
      buildExercise({
        id: 'switch-filter-pullups',
        name: 'Pull-ups',
        muscleGroups: ['Back', 'Arms (Legacy)'],
        isCustom: false,
      }),
    ],
    workouts: [
      buildWorkout({
        id: 'switch-filter-workout',
        name: 'Switch Filter Workout',
        date: '2026-03-07',
        isCompleted: false,
        exercises: [
          buildWorkoutExercise('switch-filter-bench', 0, [buildSet('switch-filter-set-1', 70, 8)]),
        ],
      }),
    ],
    settings: { defaultWeightUnit: 'kg' },
  });

  await page.goto('/fitness-app/workouts/switch-filter-workout/edit');
  await expect(page.getByRole('heading', { name: 'Edit Workout' })).toBeVisible();

  const benchCard = page.locator(
    "xpath=//h3[normalize-space()='Bench Press']/ancestor::div[contains(@class,'p-4')][1]"
  );
  await benchCard.getByRole('button').nth(2).click();
  await page.getByRole('menuitem', { name: 'Switch Exercise' }).click();

  await expect(page.getByRole('heading', { name: 'Add Exercise' })).toBeVisible();
  await expect(page.getByText('Filtering by Chest')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Pull-ups' })).toHaveCount(0);

  await page.getByRole('button', { name: 'Reset Filter' }).click();
  await expect(page.getByText('Filtering by Chest')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Pull-ups' })).toBeVisible();
});
