import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import {
  seedAppStorage,
  buildExercise,
  buildWorkout,
  buildWorkoutExercise,
  buildSet,
} from './helpers/storage';

const workoutExerciseCard = (page: Page, name: string) =>
  page.locator(
    `xpath=//h3[normalize-space()='${name}']/ancestor::div[contains(@class,'p-4')][1]`
  );

test('workout edit supports reordering exercises, deleting exercises, and persisting set changes', async ({
  page,
}) => {
  await seedAppStorage(page, {
    exercises: [
      buildExercise({
        id: 'edit-advanced-bench',
        name: 'Bench Press',
        muscleGroups: ['Chest'],
        isCustom: false,
      }),
      buildExercise({
        id: 'edit-advanced-pullups',
        name: 'Pull-ups',
        muscleGroups: ['Back'],
        isCustom: false,
      }),
      buildExercise({
        id: 'edit-advanced-squats',
        name: 'Squats',
        muscleGroups: ['Quads'],
        isCustom: false,
      }),
    ],
    workouts: [
      buildWorkout({
        id: 'workout-edit-advanced',
        name: 'Advanced Edit Workout',
        date: '2026-03-11',
        isCompleted: false,
        exercises: [
          buildWorkoutExercise('edit-advanced-bench', 0, [buildSet('bench-set-1', 80, 8)]),
          buildWorkoutExercise('edit-advanced-pullups', 1, [buildSet('pullups-set-1', 0, 10)]),
          buildWorkoutExercise('edit-advanced-squats', 2, [buildSet('squats-set-1', 90, 6)]),
        ],
      }),
    ],
    settings: { defaultWeightUnit: 'kg' },
  });

  await page.goto('/workouts/workout-edit-advanced/edit');
  await expect(page.getByRole('heading', { name: 'Edit Workout' })).toBeVisible();

  await workoutExerciseCard(page, 'Squats').getByRole('button').first().click();
  await workoutExerciseCard(page, 'Squats').getByRole('button', { name: 'Add Set' }).click();
  await workoutExerciseCard(page, 'Squats').getByPlaceholder('Weight').nth(1).fill('100');
  await workoutExerciseCard(page, 'Squats').getByPlaceholder('Reps').nth(1).fill('5');

  await workoutExerciseCard(page, 'Bench Press').getByRole('button').nth(2).click();
  await page.getByRole('menuitem', { name: 'Delete Exercise' }).click();

  await page.getByRole('button', { name: 'Save Changes' }).click();
  await expect(page.getByRole('heading', { name: 'Workouts' })).toBeVisible();

  await expect.poll(async () => {
    return page.evaluate(() => {
      const workouts = JSON.parse(localStorage.getItem('fitness-app-workouts') || '[]');
      const workout = workouts.find((entry: { id: string }) => entry.id === 'workout-edit-advanced');
      return workout?.exercises?.map(
        (exercise: {
          exerciseId: string;
          order: number;
          sets: Array<{ weight: number; reps: number; weightUnit: string }>;
        }) => ({
          exerciseId: exercise.exerciseId,
          order: exercise.order,
          sets: exercise.sets.map((set) => ({
            weight: set.weight,
            reps: set.reps,
            weightUnit: set.weightUnit,
          })),
        })
      );
    });
  }).toEqual([
    {
      exerciseId: 'edit-advanced-squats',
      order: 0,
      sets: [
        { weight: 90, reps: 6, weightUnit: 'kg' },
        { weight: 100, reps: 5, weightUnit: 'kg' },
      ],
    },
    {
      exerciseId: 'edit-advanced-pullups',
      order: 1,
      sets: [{ weight: 0, reps: 10, weightUnit: 'kg' }],
    },
  ]);
});

test('workout edit can switch an exercise and keep last completed workout defaults', async ({
  page,
}) => {
  await seedAppStorage(page, {
    exercises: [
      buildExercise({
        id: 'switch-source-bench',
        name: 'Bench Press',
        muscleGroups: ['Chest'],
        isCustom: false,
      }),
      buildExercise({
        id: 'switch-target-pushups',
        name: 'Push-ups',
        muscleGroups: ['Chest', 'Core'],
        comments: 'Exercise fallback comment',
        isCustom: false,
      }),
    ],
    workouts: [
      buildWorkout({
        id: 'switch-target-history',
        name: 'Completed Push-up Day',
        date: '2026-03-09',
        isCompleted: true,
        completedAt: '2026-03-09T12:00:00.000Z',
        exercises: [
          buildWorkoutExercise(
            'switch-target-pushups',
            0,
            [buildSet('switch-history-set-1', 20, 15)],
            'Pause at the bottom'
          ),
        ],
      }),
      buildWorkout({
        id: 'switch-edit-workout',
        name: 'Switch Exercise Workout',
        date: '2026-03-12',
        isCompleted: false,
        exercises: [
          buildWorkoutExercise('switch-source-bench', 0, [buildSet('switch-edit-set-1', 75, 8)]),
        ],
      }),
    ],
    settings: { defaultWeightUnit: 'kg' },
  });

  await page.goto('/workouts/switch-edit-workout/edit');
  await expect(page.getByRole('heading', { name: 'Edit Workout' })).toBeVisible();

  await workoutExerciseCard(page, 'Bench Press').getByRole('button').nth(2).click();
  await page.getByRole('menuitem', { name: 'Switch Exercise' }).click();
  await expect(page.getByRole('heading', { name: 'Add Exercise' })).toBeVisible();

  await page.getByRole('heading', { name: 'Push-ups' }).click();
  await expect(workoutExerciseCard(page, 'Push-ups')).toBeVisible();
  await expect(workoutExerciseCard(page, 'Bench Press')).toHaveCount(0);

  await workoutExerciseCard(page, 'Push-ups').getByRole('button', { name: 'Details' }).click();
  await expect(workoutExerciseCard(page, 'Push-ups').getByLabel('Comment')).toHaveValue(
    'Pause at the bottom'
  );
  await expect(workoutExerciseCard(page, 'Push-ups').getByPlaceholder('Weight').first()).toHaveValue(
    '20'
  );
  await expect(workoutExerciseCard(page, 'Push-ups').getByPlaceholder('Reps').first()).toHaveValue(
    '15'
  );

  await page.getByRole('button', { name: 'Save Changes' }).click();
  await expect(page.getByRole('heading', { name: 'Workouts' })).toBeVisible();

  await expect.poll(async () => {
    return page.evaluate(() => {
      const workouts = JSON.parse(localStorage.getItem('fitness-app-workouts') || '[]');
      const workout = workouts.find((entry: { id: string }) => entry.id === 'switch-edit-workout');
      return workout?.exercises?.[0];
    });
  }).toEqual(
    expect.objectContaining({
      exerciseId: 'switch-target-pushups',
      comment: 'Pause at the bottom',
      sets: [{ id: expect.any(String), weight: 20, weightUnit: 'kg', reps: 15 }],
    })
  );
});

test('workout edit menu returns to workout form after exercise save and preserves draft state', async ({
  page,
}) => {
  await seedAppStorage(page, {
    exercises: [
      buildExercise({
        id: 'edit-entrypoint-custom',
        name: 'Editable Fly',
        muscleGroups: ['Chest'],
        isCustom: true,
      }),
    ],
    workouts: [
      buildWorkout({
        id: 'edit-entrypoint-workout',
        name: 'Entry Workout',
        date: '2026-03-13',
        isCompleted: false,
        exercises: [
          buildWorkoutExercise('edit-entrypoint-custom', 0, [
            buildSet('edit-entrypoint-set-1', 12, 12),
          ]),
        ],
      }),
    ],
    settings: { defaultWeightUnit: 'kg' },
  });

  await page.goto('/workouts/edit-entrypoint-workout/edit');
  await expect(page.getByRole('heading', { name: 'Edit Workout' })).toBeVisible();

  await page.getByLabel('Workout Name').fill('Entry Workout Draft');
  await workoutExerciseCard(page, 'Editable Fly').getByPlaceholder('Weight').first().fill('15');
  await workoutExerciseCard(page, 'Editable Fly').getByPlaceholder('Reps').first().fill('9');

  await workoutExerciseCard(page, 'Editable Fly').getByRole('button').nth(2).click();
  await page.getByRole('menuitem', { name: 'Edit Exercise' }).click();

  await expect(page.getByRole('heading', { name: 'Edit Exercise' })).toBeVisible();
  await page.getByLabel('Exercise Name').fill('Editable Fly Updated');
  await page.getByRole('button', { name: 'Save Exercise' }).click();

  await expect(page).toHaveURL('/workouts/edit-entrypoint-workout/edit');
  await expect(page.getByRole('heading', { name: 'Edit Workout' })).toBeVisible();
  await expect(page.getByLabel('Workout Name')).toHaveValue('Entry Workout Draft');
  await expect(page.getByRole('heading', { name: 'Editable Fly Updated' })).toBeVisible();
  await expect(workoutExerciseCard(page, 'Editable Fly Updated').getByPlaceholder('Weight').first()).toHaveValue('15');
  await expect(workoutExerciseCard(page, 'Editable Fly Updated').getByPlaceholder('Reps').first()).toHaveValue('9');
});

test('workout create returns to form after exercise save and keeps unsaved draft state', async ({
  page,
}) => {
  await seedAppStorage(page, {
    exercises: [
      buildExercise({
        id: 'create-entrypoint-custom',
        name: 'Draft Fly',
        muscleGroups: ['Chest'],
        isCustom: true,
      }),
    ],
    workouts: [],
    settings: { defaultWeightUnit: 'kg' },
  });

  await page.goto('/workouts/new');
  await expect(page.getByRole('heading', { name: 'Create Workout' })).toBeVisible();

  await page.getByLabel('Workout Name').fill('Workout Draft');
  await page.getByRole('button', { name: 'Add Exercise' }).click();
  await page.getByRole('heading', { name: 'Draft Fly' }).click();

  await expect(workoutExerciseCard(page, 'Draft Fly')).toBeVisible();
  await workoutExerciseCard(page, 'Draft Fly').getByPlaceholder('Weight').first().fill('11');
  await workoutExerciseCard(page, 'Draft Fly').getByPlaceholder('Reps').first().fill('7');

  await workoutExerciseCard(page, 'Draft Fly').getByRole('button').nth(2).click();
  await page.getByRole('menuitem', { name: 'Edit Exercise' }).click();
  await expect(page.getByRole('heading', { name: 'Edit Exercise' })).toBeVisible();

  await page.getByLabel('Exercise Name').fill('Draft Fly Updated');
  await page.getByRole('button', { name: 'Save Exercise' }).click();

  await expect(page).toHaveURL('/workouts/new');
  await expect(page.getByRole('heading', { name: 'Create Workout' })).toBeVisible();
  await expect(page.getByLabel('Workout Name')).toHaveValue('Workout Draft');
  await expect(workoutExerciseCard(page, 'Draft Fly Updated')).toBeVisible();
  await expect(workoutExerciseCard(page, 'Draft Fly Updated').getByPlaceholder('Weight').first()).toHaveValue('11');
  await expect(workoutExerciseCard(page, 'Draft Fly Updated').getByPlaceholder('Reps').first()).toHaveValue('7');
});

test('workout edit menu returns to workout form after exercise cancel and preserves draft state', async ({
  page,
}) => {
  await seedAppStorage(page, {
    exercises: [
      buildExercise({
        id: 'cancel-edit-entrypoint-custom',
        name: 'Editable Raise',
        muscleGroups: ['Shoulders'],
        isCustom: true,
      }),
    ],
    workouts: [
      buildWorkout({
        id: 'cancel-edit-entrypoint-workout',
        name: 'Cancel Entry Workout',
        date: '2026-03-14',
        isCompleted: false,
        exercises: [
          buildWorkoutExercise('cancel-edit-entrypoint-custom', 0, [
            buildSet('cancel-edit-entrypoint-set-1', 10, 12),
          ]),
        ],
      }),
    ],
    settings: { defaultWeightUnit: 'kg' },
  });

  await page.goto('/workouts/cancel-edit-entrypoint-workout/edit');
  await expect(page.getByRole('heading', { name: 'Edit Workout' })).toBeVisible();

  await page.getByLabel('Workout Name').fill('Cancel Entry Workout Draft');
  await workoutExerciseCard(page, 'Editable Raise').getByPlaceholder('Weight').first().fill('14');
  await workoutExerciseCard(page, 'Editable Raise').getByPlaceholder('Reps').first().fill('8');

  await workoutExerciseCard(page, 'Editable Raise').getByRole('button').nth(2).click();
  await page.getByRole('menuitem', { name: 'Edit Exercise' }).click();

  await expect(page.getByRole('heading', { name: 'Edit Exercise' })).toBeVisible();
  await page.getByLabel('Exercise Name').fill('Editable Raise Should Not Save');
  await page.getByRole('button', { name: 'Cancel' }).click();

  await expect(page).toHaveURL('/workouts/cancel-edit-entrypoint-workout/edit');
  await expect(page.getByRole('heading', { name: 'Edit Workout' })).toBeVisible();
  await expect(page.getByLabel('Workout Name')).toHaveValue('Cancel Entry Workout Draft');
  await expect(page.getByRole('heading', { name: 'Editable Raise' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Editable Raise Should Not Save' })).toHaveCount(0);
  await expect(workoutExerciseCard(page, 'Editable Raise').getByPlaceholder('Weight').first()).toHaveValue('14');
  await expect(workoutExerciseCard(page, 'Editable Raise').getByPlaceholder('Reps').first()).toHaveValue('8');
});

test('workout create returns to form after exercise cancel and preserves draft state', async ({
  page,
}) => {
  await seedAppStorage(page, {
    exercises: [
      buildExercise({
        id: 'cancel-create-entrypoint-custom',
        name: 'Draft Press',
        muscleGroups: ['Chest'],
        isCustom: true,
      }),
    ],
    workouts: [],
    settings: { defaultWeightUnit: 'kg' },
  });

  await page.goto('/workouts/new');
  await expect(page.getByRole('heading', { name: 'Create Workout' })).toBeVisible();

  await page.getByLabel('Workout Name').fill('Cancel Workout Draft');
  await page.getByRole('button', { name: 'Add Exercise' }).click();
  await page.getByRole('heading', { name: 'Draft Press' }).click();

  await expect(workoutExerciseCard(page, 'Draft Press')).toBeVisible();
  await workoutExerciseCard(page, 'Draft Press').getByPlaceholder('Weight').first().fill('22');
  await workoutExerciseCard(page, 'Draft Press').getByPlaceholder('Reps').first().fill('6');

  await workoutExerciseCard(page, 'Draft Press').getByRole('button').nth(2).click();
  await page.getByRole('menuitem', { name: 'Edit Exercise' }).click();
  await expect(page.getByRole('heading', { name: 'Edit Exercise' })).toBeVisible();

  await page.getByLabel('Exercise Name').fill('Draft Press Should Not Save');
  await page.getByRole('button', { name: 'Cancel' }).click();

  await expect(page).toHaveURL('/workouts/new');
  await expect(page.getByRole('heading', { name: 'Create Workout' })).toBeVisible();
  await expect(page.getByLabel('Workout Name')).toHaveValue('Cancel Workout Draft');
  await expect(workoutExerciseCard(page, 'Draft Press')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Draft Press Should Not Save' })).toHaveCount(0);
  await expect(workoutExerciseCard(page, 'Draft Press').getByPlaceholder('Weight').first()).toHaveValue('22');
  await expect(workoutExerciseCard(page, 'Draft Press').getByPlaceholder('Reps').first()).toHaveValue('6');
});
