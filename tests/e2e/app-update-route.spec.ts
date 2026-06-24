import { expect, test } from '@playwright/test'
import { STORAGE_KEYS, seedAppStorage } from './helpers/storage'

test('settings page opens the App Update Page', async ({ page }) => {
  await seedAppStorage(page, {
    workouts: [],
    settings: { defaultWeightUnit: 'kg' },
  })

  await page.goto('/settings')
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()

  await page.getByRole('link', { name: 'Open App Update' }).click()

  await expect(page).toHaveURL(/\/app-update$/)
  await expect(page.getByRole('heading', { name: 'App Update' })).toBeVisible()
})

test('App Update Page shows a valid state when service workers are blocked', async ({
  page,
}) => {
  await page.goto('/app-update')

  await expect(page.getByRole('heading', { name: 'App Update' })).toBeVisible()
  await expect(
    page.getByText(/Update checks are unavailable|You're up to date/),
  ).toBeVisible()
  await expect(page.getByRole('button', { name: 'Update now' })).toHaveCount(0)
})

test('App Update Page is not saved or restored as the last visited route', async ({
  page,
}) => {
  await seedAppStorage(page, {
    workouts: [],
    settings: { defaultWeightUnit: 'kg' },
    lastVisitedPath: '/workouts',
  })

  await page.goto('/app-update')
  await expect(page.getByRole('heading', { name: 'App Update' })).toBeVisible()

  await expect
    .poll(async () => {
      return page.evaluate((lastVisitedKey) => {
        return JSON.parse(localStorage.getItem(lastVisitedKey) || '""')
      }, STORAGE_KEYS.LAST_VISITED_PATH)
    })
    .toBe('/workouts')

  const restoredPage = await page.context().newPage()
  await seedAppStorage(restoredPage, {
    workouts: [],
    settings: { defaultWeightUnit: 'kg' },
    lastVisitedPath: '/app-update',
  })

  await restoredPage.goto('/')
  await expect(
    restoredPage.getByRole('heading', { name: 'Dashboard' }),
  ).toBeVisible()
  await expect(restoredPage).toHaveURL(/\/$/)
})
