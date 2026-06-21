import { readSettings, readSettingsSnapshot } from './settings-source'
import { createQuery } from '@/lib/query-factory'

export const settingsQueryKeys = {
  all: ['settings'] as const,
  detail: () => [...settingsQueryKeys.all, 'detail'] as const,
}

export const settingsQueries = {
  detail: () =>
    createQuery(settingsQueryKeys.detail(), readSettings, {
      initialData: readSettingsSnapshot,
    }),
}
