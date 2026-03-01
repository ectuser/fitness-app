import { test, expect } from '@playwright/test';
import { clearAppStorage } from './helpers/storage';

test('dashboard smoke navigation and quick stats render', async ({ page }) => {
  await clearAppStorage(page);
  await page.goto('');

  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Quick Stats' })).toBeVisible();
  await expect(page.getByText('Exercises').first()).toBeVisible();

  await page.getByRole('link', { name: 'Workouts' }).click();
  await expect(page.getByRole('heading', { name: 'Workouts' })).toBeVisible();

  await page.getByRole('link', { name: 'Exercises' }).click();
  await expect(page.getByRole('heading', { name: 'Exercises' })).toBeVisible();

  await page.getByRole('link', { name: 'Home' }).click();
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
});
