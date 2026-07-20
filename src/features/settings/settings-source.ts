import type { Settings } from '@/types'
import { SettingsSchema } from '@/lib/fitness-schemas'
import { STORAGE_KEYS, getFromStorage, saveToStorage } from '@/lib/storage'

export const DEFAULT_SETTINGS: Settings = {
  defaultWeightUnit: 'kg',
  themeMode: 'system',
}

export function readSettingsSnapshot(): Settings {
  const storedSettings = getFromStorage<Partial<Settings>>(
    STORAGE_KEYS.SETTINGS,
    DEFAULT_SETTINGS,
  )
  const settings = SettingsSchema.parse({
    ...DEFAULT_SETTINGS,
    ...storedSettings,
  })

  saveToStorage(STORAGE_KEYS.SETTINGS, settings)

  return settings
}

export async function readSettings(): Promise<Settings> {
  return readSettingsSnapshot()
}

export async function updateSettings(
  updates: Partial<Settings>,
): Promise<Settings> {
  const currentSettings = await readSettings()
  const nextSettings = SettingsSchema.parse({ ...currentSettings, ...updates })

  saveToStorage(STORAGE_KEYS.SETTINGS, nextSettings)

  return nextSettings
}
