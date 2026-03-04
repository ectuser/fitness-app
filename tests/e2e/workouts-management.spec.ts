import { test, expect } from './fixtures';
import {
  clearAppStorage,
  seedAppStorage,
  buildExercise,
  buildWorkout,
  buildWorkoutExercise,
  buildSet,
} from './helpers/storage';

test('workout create with selector search and sets', async ({ page }) => {
  await clearAppStorage(page);
  await page.goto('workouts/new');

  await page.getByLabel('Workout Name').fill('Push Day');
  await page.getByRole('button', { name: 'Add Exercise' }).click();
  await page.getByPlaceholder('Search exercises...').fill('Bench Press');
  await page.getByRole('heading', { name: 'Bench Press' }).click();

  await expect(page.getByRole('heading', { name: 'Bench Press' })).toBeVisible();

  await page.getByPlaceholder('Weight').first().fill('80');
  await page.getByPlaceholder('Reps').first().fill('8');
  await page.getByRole('button', { name: 'Create Workout' }).click();

  await expect(page.getByRole('heading', { name: 'Workouts' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Push Day' })).toBeVisible();
});

test('workout edit and save changes', async ({ page }) => {
  await seedAppStorage(page, {
    exercises: [
      buildExercise({
        id: 'exercise-bench',
        name: 'Bench Press',
        muscleGroups: ['Chest', 'Arms'],
        isCustom: false,
      }),
      buildExercise({
        id: 'exercise-pullups',
        name: 'Pull-ups',
        muscleGroups: ['Back', 'Arms'],
        isCustom: false,
      }),
    ],
    workouts: [
      buildWorkout({
        id: 'workout-edit-1',
        name: 'Upper Mix',
        date: '2026-03-02',
        isCompleted: false,
        exercises: [
          buildWorkoutExercise('exercise-bench', 0, [buildSet('set-bench-1', 80, 8)]),
          buildWorkoutExercise('exercise-pullups', 1, [buildSet('set-pull-1', 0, 10)]),
        ],
      }),
    ],
    settings: { defaultWeightUnit: 'kg' },
  });

  await page.goto('/fitness-app/workouts/workout-edit-1/edit');
  await expect(page.getByRole('heading', { name: 'Edit Workout' })).toBeVisible();

  await page.getByLabel('Workout Name').fill('Upper Mix Updated');

  await page.getByRole('button', { name: 'Save Changes' }).click();

  await expect(page.getByRole('heading', { name: 'Workouts' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Upper Mix Updated' })).toBeVisible();
  await expect(page.getByText('2 exercises')).toBeVisible();
});

test('workout menu duplicate delete and complete/incomplete transitions', async ({ page }) => {
  await seedAppStorage(page, {
    exercises: [
      buildExercise({
        id: 'exercise-menu-bench',
        name: 'Bench Press',
        muscleGroups: ['Chest', 'Arms'],
        isCustom: false,
      }),
    ],
    workouts: [
      buildWorkout({
        id: 'workout-menu-1',
        name: 'Menu Day',
        date: '2026-03-03',
        isCompleted: false,
        exercises: [
          buildWorkoutExercise('exercise-menu-bench', 0, [buildSet('set-menu-1', 70, 10)]),
        ],
      }),
    ],
    settings: { defaultWeightUnit: 'kg' },
  });

  const workoutCard = (name: string) =>
    page.locator(`xpath=//h3[normalize-space()='${name}']/ancestor::div[contains(@class,'p-4')][1]`);

  await page.goto('workouts');
  await expect(page.getByRole('heading', { name: 'Menu Day' })).toBeVisible();

  await workoutCard('Menu Day').getByRole('button').first().click();
  await page.getByRole('menuitem', { name: 'Duplicate' }).click();
  await expect(page.getByRole('heading', { name: 'Menu Day (Copy)' })).toBeVisible();

  await workoutCard('Menu Day (Copy)').getByRole('button').first().click();
  await page.getByRole('menuitem', { name: 'Delete' }).click();
  await page.getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByRole('heading', { name: 'Menu Day (Copy)' })).toHaveCount(0);

  await workoutCard('Menu Day').getByRole('button').first().click();
  await page.getByRole('menuitem', { name: 'Mark Complete' }).click();
  await expect(page.getByRole('heading', { name: 'Menu Day' })).toHaveCount(0);

  await page.getByRole('button', { name: 'Completed' }).click();
  await expect(page.getByRole('heading', { name: 'Completed Workouts' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Menu Day' })).toBeVisible();

  await workoutCard('Menu Day').getByRole('button').first().click();
  await page.getByRole('menuitem', { name: 'Mark Incomplete' }).click();
  await expect(page.getByRole('heading', { name: 'Menu Day' })).toHaveCount(0);

  await page.getByRole('button', { name: 'Upcoming' }).click();
  await expect(page.getByRole('heading', { name: 'Workouts' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Menu Day' })).toBeVisible();
});
