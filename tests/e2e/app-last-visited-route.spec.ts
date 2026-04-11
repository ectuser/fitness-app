import { test, expect } from '@playwright/test';
import { seedAppStorage } from './helpers/storage';

test('app restores last visited page and falls back safely for invalid saved route', async ({ page }) => {
  await seedAppStorage(page, {
    workouts: [],
    settings: { defaultWeightUnit: 'kg' },
    lastVisitedPath: '/workouts',
  });

  await page.goto('');
  await expect(page.getByRole('heading', { name: 'Workouts' })).toBeVisible();
  await expect(page).toHaveURL(/\/workouts$/);

  await page.getByRole('link', { name: 'Exercises' }).click();
  await expect(page.getByRole('heading', { name: 'Exercises' })).toBeVisible();
  await expect.poll(async () => {
    return page.evaluate(() => {
      return JSON.parse(localStorage.getItem('fitness-app-last-visited-path') || '""');
    });
  }).toBe('/exercises');

  const reopenedPage = await page.context().newPage();
  await reopenedPage.goto('/');
  await expect(reopenedPage.getByRole('heading', { name: 'Exercises' })).toBeVisible();
  await expect(reopenedPage).toHaveURL(/\/exercises$/);

  await reopenedPage.evaluate(() => {
    localStorage.setItem('fitness-app-last-visited-path', JSON.stringify('/not-a-real-route'));
  });

  const invalidRoutePage = await page.context().newPage();
  await invalidRoutePage.goto('/');
  await expect(invalidRoutePage.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  await expect(invalidRoutePage).toHaveURL(/\/$/);
});
