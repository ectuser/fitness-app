import { test, expect } from './fixtures';
import {
  clearAppStorage,
  seedAppStorage,
  buildExercise,
  buildWorkout,
  buildWorkoutExercise,
  buildSet,
} from './helpers/storage';

test('save and finish creates completed workout from create page', async ({ page }) => {
  await clearAppStorage(page);
  await page.goto('workouts/new');

  await page.getByLabel('Workout Name').fill('Finish From Create');
  await page.getByRole('button', { name: 'Add Exercise' }).click();
  await page.getByRole('heading', { name: 'Bench Press' }).click();

  await page.getByRole('button', { name: 'Save and Finish Workout' }).click();

  await expect(page.getByRole('heading', { name: 'Completed Workouts' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Finish From Create' })).toBeVisible();

  await expect.poll(async () => {
    return page.evaluate(() => {
      const workouts = JSON.parse(localStorage.getItem('fitness-app-workouts') || '[]');
      const workout = workouts.find((w: { name: string }) => w.name === 'Finish From Create');
      if (!workout) return null;
      return {
        isCompleted: Boolean(workout.isCompleted),
        hasCompletedAt: Boolean(workout.completedAt),
      };
    });
  }).toEqual({ isCompleted: true, hasCompletedAt: true });
});

test('save and finish updates existing workout from edit page', async ({ page }) => {
  await seedAppStorage(page, {
    exercises: [
      buildExercise({
        id: 'save-finish-bench',
        name: 'Bench Press',
        muscleGroups: ['Chest', 'Arms (Legacy)'],
        isCustom: false,
      }),
    ],
    workouts: [
      buildWorkout({
        id: 'save-finish-workout',
        name: 'Finish From Edit',
        date: '2026-03-06',
        isCompleted: false,
        exercises: [
          buildWorkoutExercise('save-finish-bench', 0, [buildSet('save-finish-set-1', 60, 10)]),
        ],
      }),
    ],
    settings: { defaultWeightUnit: 'kg' },
  });

  await page.goto('/fitness-app/workouts/save-finish-workout/edit');
  await expect(page.getByRole('heading', { name: 'Edit Workout' })).toBeVisible();

  await page.getByLabel('Workout Name').fill('Finish From Edit Updated');
  await page.getByRole('button', { name: 'Save and Finish Workout' }).click();

  await expect(page.getByRole('heading', { name: 'Completed Workouts' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Finish From Edit Updated' })).toBeVisible();

  await expect.poll(async () => {
    return page.evaluate(() => {
      const workouts = JSON.parse(localStorage.getItem('fitness-app-workouts') || '[]');
      const workout = workouts.find((w: { id: string }) => w.id === 'save-finish-workout');
      if (!workout) return null;
      return {
        name: workout.name,
        isCompleted: Boolean(workout.isCompleted),
        hasCompletedAt: Boolean(workout.completedAt),
      };
    });
  }).toEqual({
    name: 'Finish From Edit Updated',
    isCompleted: true,
    hasCompletedAt: true,
  });
});
