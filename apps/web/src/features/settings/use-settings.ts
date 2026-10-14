import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { settingsMutations } from './settings-mutations'
import { settingsQueries } from './settings-queries'
import { DEFAULT_SETTINGS } from './settings-source'
import type { UpdateSettingsInput } from './settings-mutations'

export function useSettings() {
  const queryClient = useQueryClient()
  const { data } = useQuery(settingsQueries.detail())
  const updateSettingsMutation = useMutation(
    settingsMutations.update(queryClient),
  )

  return {
    settings: data ?? DEFAULT_SETTINGS,
    updateSettings: (updates: UpdateSettingsInput) => {
      updateSettingsMutation.mutate(updates)
    },
  }
}
