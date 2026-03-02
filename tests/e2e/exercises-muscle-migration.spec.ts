import { test, expect } from '@playwright/test';
import { seedAppStorage, buildExercise } from './helpers/storage';

test('muscle taxonomy migration and exercise form options', async ({ page }) => {
  await seedAppStorage(page, {
    exercises: [
      buildExercise({
        id: 'migration-old-arms',
        name: 'Legacy Arms Exercise',
        muscleGroups: ['Arms'],
        isCustom: true,
      }),
      buildExercise({
        id: 'migration-old-legs',
        name: 'Legacy Legs Exercise',
        muscleGroups: ['Legs'],
        isCustom: true,
      }),
      buildExercise({
        id: 'migration-old-full',
        name: 'Legacy Full Body Exercise',
        muscleGroups: ['Full Body'],
        isCustom: true,
      }),
    ],
    workouts: [],
    settings: { defaultWeightUnit: 'kg' },
  });

  await page.goto('exercises');

  await expect.poll(async () => {
    return page.evaluate(() => {
      const raw = localStorage.getItem('fitness-app-exercises');
      const exercises = raw ? JSON.parse(raw) : [];
      const byName = Object.fromEntries(
        exercises.map((exercise: { name: string; muscleGroups: string[] }) => [exercise.name, exercise.muscleGroups])
      );
      return {
        arms: byName['Legacy Arms Exercise']?.[0],
        legs: byName['Legacy Legs Exercise']?.[0],
        full: byName['Legacy Full Body Exercise']?.[0],
      };
    });
  }).toEqual({
    arms: 'Arms (Legacy)',
    legs: 'Legs (Legacy)',
    full: 'None',
  });

  await expect(page.getByText('Arms (Legacy)')).toBeVisible();
  await expect(page.getByText('Legs (Legacy)')).toBeVisible();
  await expect(page.getByText('None')).toBeVisible();

  await page.getByRole('button', { name: 'New' }).click();
  await expect(page.getByRole('heading', { name: 'Create Exercise' })).toBeVisible();

  await expect(page.getByRole('button', { name: 'Biceps' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Triceps' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Quads' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Hamstrings' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Glutes' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Calves' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'None' })).toBeVisible();

  await expect(page.getByRole('button', { name: 'Arms (Legacy)' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Legs (Legacy)' })).toHaveCount(0);
});
