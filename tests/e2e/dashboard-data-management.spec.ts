import { readFile } from 'node:fs/promises';
import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import {
  STORAGE_KEYS,
  seedAppStorage,
  buildExercise,
  buildWorkout,
  buildWorkoutExercise,
  buildSet,
} from './helpers/storage';

const openDashboardMenu = async (page: Page) => {
  await page.getByRole('button').first().click();
};

test('dashboard export downloads the current app data', async ({ page }) => {
  await seedAppStorage(page, {
    exercises: [
      buildExercise({
        id: 'export-exercise-1',
        name: 'Export Bench',
        muscleGroups: ['Chest'],
        isCustom: true,
      }),
    ],
    workouts: [
      buildWorkout({
        id: 'export-workout-1',
        name: 'Export Workout',
        date: '2026-03-08',
        isCompleted: true,
        completedAt: '2026-03-08T09:00:00.000Z',
        exercises: [
          buildWorkoutExercise('export-exercise-1', 0, [buildSet('export-set-1', 80, 8)]),
        ],
      }),
    ],
    settings: { defaultWeightUnit: 'lb' },
  });

  await page.goto('');
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

  await openDashboardMenu(page);
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('menuitem', { name: 'Export Data' }).click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toMatch(/^fitness-app-backup-\d{4}-\d{2}-\d{2}\.json$/);

  const downloadPath = await download.path();
  expect(downloadPath).not.toBeNull();
  if (!downloadPath) {
    throw new Error('Expected Playwright to provide a download path');
  }

  const exportPayload: {
    version: string;
    data: {
      exercises: Array<{ name: string }>;
      workouts: Array<{ name: string }>;
      settings: { defaultWeightUnit: string };
    };
  } = JSON.parse(await readFile(downloadPath, 'utf8'));

  expect(exportPayload.version).toBe('1.0');
  expect(exportPayload.data.exercises).toEqual(
    expect.arrayContaining([expect.objectContaining({ name: 'Export Bench' })])
  );
  expect(exportPayload.data.workouts).toEqual(
    expect.arrayContaining([expect.objectContaining({ name: 'Export Workout' })])
  );
  expect(exportPayload.data.settings.defaultWeightUnit).toBe('lb');
});

test('dashboard import shows an error for malformed backup files', async ({ page }) => {
  await seedAppStorage(page, {
    workouts: [],
    settings: { defaultWeightUnit: 'kg' },
  });

  await page.goto('');
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

  await page.locator('input[type="file"]').setInputFiles({
    name: 'broken-backup.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{broken-json'),
  });

  await expect(page.getByRole('heading', { name: 'Import Failed' })).toBeVisible();
  await expect(
    page.getByText("Failed to read backup file. Please make sure it's a valid JSON file.")
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Import Data' })).toHaveCount(0);
});

test('dashboard import replaces local data and migrates imported exercises', async ({ page }) => {
  const existingExercises = [
    buildExercise({
      id: 'old-import-exercise',
      name: 'Old Exercise',
      muscleGroups: ['Back'],
      isCustom: true,
    }),
  ];
  const existingWorkouts = [
    buildWorkout({
      id: 'old-import-workout',
      name: 'Old Workout',
      date: '2026-03-01',
      isCompleted: false,
      exercises: [
        buildWorkoutExercise('old-import-exercise', 0, [buildSet('old-import-set', 50, 10)]),
      ],
    }),
  ];

  const importPayload = {
    version: '1.0',
    data: {
      exercises: [
        {
          id: 'imported-arms',
          name: 'Imported Arms',
          muscleGroups: ['Arms'],
          comments: 'Imported comment',
          isCustom: true,
          createdAt: '2026-03-09T10:00:00.000Z',
        },
        {
          id: 'imported-full-body',
          name: 'Imported Full Body',
          muscleGroups: ['Full Body'],
          isCustom: true,
          createdAt: '2026-03-09T10:00:00.000Z',
        },
      ],
      workouts: [
        {
          id: 'imported-workout',
          name: 'Imported Workout',
          date: '2026-05-10',
          exercises: [
            {
              exerciseId: 'imported-arms',
              order: 0,
              sets: [{ id: 'imported-set', weight: 22.5, weightUnit: 'kg', reps: 12 }],
            },
          ],
          isCompleted: false,
          createdAt: '2026-03-09T10:00:00.000Z',
          updatedAt: '2026-03-09T10:00:00.000Z',
        },
      ],
      settings: { defaultWeightUnit: 'lb' },
    },
  };

  await page.goto('');
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  await page.evaluate(
    ({ keys, exercises, workouts }) => {
      localStorage.setItem(keys.EXERCISES, JSON.stringify(exercises));
      localStorage.setItem(keys.WORKOUTS, JSON.stringify(workouts));
      localStorage.setItem(keys.SETTINGS, JSON.stringify({ defaultWeightUnit: 'kg' }));
    },
    {
      keys: STORAGE_KEYS,
      exercises: existingExercises,
      workouts: existingWorkouts,
    }
  );
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

  await page.locator('input[type="file"]').setInputFiles({
    name: 'backup.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(importPayload)),
  });

  await expect(page.getByRole('heading', { name: 'Import Data?' })).toBeVisible();
  await page.getByRole('button', { name: 'Import Data' }).click();

  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

  await expect.poll(async () => {
    return page.evaluate(() => {
      const exercises = JSON.parse(localStorage.getItem('fitness-app-exercises') || '[]');
      const workouts = JSON.parse(localStorage.getItem('fitness-app-workouts') || '[]');
      const settings = JSON.parse(localStorage.getItem('fitness-app-settings') || '{}');

      return {
        exerciseNames: exercises.map((exercise: { name: string }) => exercise.name),
        musclesByName: Object.fromEntries(
          exercises.map((exercise: { name: string; muscleGroups: string[] }) => [
            exercise.name,
            exercise.muscleGroups,
          ])
        ),
        workoutNames: workouts.map((workout: { name: string }) => workout.name),
        defaultWeightUnit: settings.defaultWeightUnit,
      };
    });
  }).toEqual({
    exerciseNames: ['Imported Arms', 'Imported Full Body'],
    musclesByName: {
      'Imported Arms': ['Arms (Legacy)'],
      'Imported Full Body': ['None'],
    },
    workoutNames: ['Imported Workout'],
    defaultWeightUnit: 'lb',
  });
});
