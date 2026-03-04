import { expect, test } from './fixtures';

test('dashboard export triggers backup download', async ({ page }) => {
  await page.goto('');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

  await page.getByRole('button').first().click();

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('menuitem', { name: 'Export Data' }).click(),
  ]);

  expect(download.suggestedFilename()).toMatch(/^fitness-app-backup-\d{4}-\d{2}-\d{2}\.json$/);
});

test('dashboard import validates and applies backup payload', async ({ page }) => {
  await page.goto('');
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await page.getByRole('button').first().click();
  await page.getByRole('menuitem', { name: 'Import Data' }).click();
  await page.locator('input[type="file"]').setInputFiles({
    name: 'invalid.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{broken-json'),
  });

  await expect(page.getByRole('heading', { name: 'Import Failed' })).toBeVisible();
  await expect(page.getByRole('alertdialog')).toContainText('JSON');
  await page.getByRole('button', { name: 'Cancel' }).click();

  await page.getByRole('button').first().click();
  await page.getByRole('menuitem', { name: 'Import Data' }).click();
  await page.locator('input[type="file"]').setInputFiles({
    name: 'backup.json',
    mimeType: 'application/json',
    buffer: Buffer.from(
      JSON.stringify({
        data: {
          exercises: [
            {
              id: 'imported-exercise',
              name: 'Imported Exercise',
              muscleGroups: ['Arms'],
              isCustom: true,
              createdAt: '2026-01-01T00:00:00.000Z',
            },
          ],
          workouts: [],
          settings: {
            defaultWeightUnit: 'kg',
          },
        },
      })
    ),
  });

  await expect(page.getByRole('heading', { name: 'Import Data?' })).toBeVisible();
  await page.getByRole('button', { name: 'Import Data' }).click();

  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  await expect.poll(async () => {
    return page.evaluate(() => {
      const exercises = JSON.parse(localStorage.getItem('fitness-app-exercises') || '[]');
      return exercises.some(
        (exercise: { id: string; muscleGroups: string[] }) =>
          exercise.id === 'imported-exercise' &&
          exercise.muscleGroups.length === 1 &&
          exercise.muscleGroups[0] === 'Arms (Legacy)'
      );
    });
  }).toBe(true);
});
