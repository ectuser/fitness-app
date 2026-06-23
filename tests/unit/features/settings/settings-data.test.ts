import { beforeEach, describe, expect, it } from 'vitest'
import {
  DEFAULT_SETTINGS,
  readSettings,
  updateSettings,
} from '@/features/settings/settings-source'
import {
  settingsQueries,
  settingsQueryKeys,
} from '@/features/settings/settings-queries'
import { STORAGE_KEYS } from '@/lib/storage'

describe('settings data feature', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('reads default settings asynchronously and persists the default shape', async () => {
    const settingsRequest = readSettings()

    expect(settingsRequest).toBeInstanceOf(Promise)
    await expect(settingsRequest).resolves.toEqual(DEFAULT_SETTINGS)
    expect(
      JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) ?? 'null'),
    ).toEqual(DEFAULT_SETTINGS)
  })

  it('reads stored settings asynchronously', async () => {
    localStorage.setItem(
      STORAGE_KEYS.SETTINGS,
      JSON.stringify({ themeMode: 'dark' }),
    )

    await expect(readSettings()).resolves.toEqual({
      defaultWeightUnit: 'kg',
      themeMode: 'dark',
    })
  })

  it('updates stored settings asynchronously by merging with the current settings', async () => {
    localStorage.setItem(
      STORAGE_KEYS.SETTINGS,
      JSON.stringify(DEFAULT_SETTINGS),
    )

    const settingsRequest = updateSettings({ defaultWeightUnit: 'lb' })

    expect(settingsRequest).toBeInstanceOf(Promise)
    await expect(settingsRequest).resolves.toEqual({
      defaultWeightUnit: 'lb',
      themeMode: 'system',
    })
    expect(
      JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) ?? 'null'),
    ).toEqual({
      defaultWeightUnit: 'lb',
      themeMode: 'system',
    })
  })

  it('defines a feature-owned settings query through the shared query factory', async () => {
    localStorage.setItem(
      STORAGE_KEYS.SETTINGS,
      JSON.stringify({ defaultWeightUnit: 'lb' }),
    )

    const query = settingsQueries.detail()
    const queryFn = query.queryFn as () => Promise<{
      defaultWeightUnit: 'lb'
      themeMode: 'system'
    }>

    expect(query.queryKey).toEqual(settingsQueryKeys.detail())
    await expect(queryFn()).resolves.toEqual({
      defaultWeightUnit: 'lb',
      themeMode: 'system',
    })
  })
})
