import { expect, test } from '@playwright/test'
import { STORAGE_KEYS, seedAppStorage } from './helpers/storage'

test('dashboard settings icon navigates to settings', async ({ page }) => {
  await seedAppStorage(page, {
    workouts: [],
    settings: { defaultWeightUnit: 'kg', themeMode: 'system' },
  })

  await page.goto('')
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()

  await page.getByRole('link', { name: 'Settings' }).click()

  await expect(page).toHaveURL(/\/settings$/)
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()
})

test('user can choose light, dark, and system themes', async ({ page }) => {
  await seedAppStorage(page, {
    workouts: [],
    settings: { defaultWeightUnit: 'kg', themeMode: 'light' },
  })

  await page.goto('/settings')
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()
  await expect(page.locator('html')).not.toHaveClass(/dark/)

  await page.getByRole('combobox', { name: 'Theme' }).click()
  await page.getByRole('option', { name: 'Dark' }).click()

  await expect(page.locator('html')).toHaveClass(/dark/)
  await expect
    .poll(() =>
      page.evaluate((settingsKey) => {
        return JSON.parse(localStorage.getItem(settingsKey) || '{}').themeMode
      }, STORAGE_KEYS.SETTINGS),
    )
    .toBe('dark')

  await page.getByRole('combobox', { name: 'Theme' }).click()
  await page.getByRole('option', { name: 'Light' }).click()

  await expect(page.locator('html')).not.toHaveClass(/dark/)

  await page.emulateMedia({ colorScheme: 'dark' })
  await page.getByRole('combobox', { name: 'Theme' }).click()
  await page.getByRole('option', { name: 'System' }).click()

  await expect(page.locator('html')).toHaveClass(/dark/)

  await page.emulateMedia({ colorScheme: 'light' })

  await expect(page.locator('html')).not.toHaveClass(/dark/)
})
