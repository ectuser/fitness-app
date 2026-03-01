import { test, expect } from '@playwright/test';
import {
  seedAppStorage,
  buildExercise,
  buildWorkout,
  buildWorkoutExercise,
  buildSet,
} from './helpers/storage';

test('dashboard reset data clears workouts and restores seeded exercises', async ({ page }) => {
  await seedAppStorage(page, {
    exercises: [
      buildExercise({
        id: 'exercise-reset-1',
        name: 'Reset Test Exercise',
        muscleGroups: ['Core'],
        isCustom: true,
      }),
    ],
    workouts: [
      buildWorkout({
        id: 'workout-reset-1',
        name: 'Reset Workout',
        date: '2026-03-05',
        isCompleted: false,
        exercises: [
          buildWorkoutExercise('exercise-reset-1', 0, [buildSet('set-reset-1', 10, 10)]),
        ],
      }),
    ],
    settings: { defaultWeightUnit: 'kg' },
  });

  await page.goto('');
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

  await page.getByRole('button').first().click();
  await page.getByRole('menuitem', { name: 'Reset Data' }).click();

  await expect(page.getByRole('heading', { name: 'Reset All Data?' })).toBeVisible();
  await page.getByRole('button', { name: 'Reset Data' }).click();

  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  await expect(page.getByText('No upcoming workouts.')).toBeVisible();

  await expect.poll(async () => {
    return page.evaluate(() => {
      const workouts = JSON.parse(localStorage.getItem('fitness-app-workouts') || '[]');
      const exercises = JSON.parse(localStorage.getItem('fitness-app-exercises') || '[]');
      return { workouts: workouts.length, exercises: exercises.length };
    });
  }).toEqual({ workouts: 0, exercises: 15 });
});
