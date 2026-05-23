import type { QueryClient } from '@tanstack/react-query';
import { updateSettings } from './settings-source';
import { settingsQueryKeys } from './settings-queries';
import type { Settings } from '@/types';

export const settingsMutations = {
  update: (queryClient: QueryClient) => ({
    mutationFn: updateSettings,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: settingsQueryKeys.detail(),
      });
    },
  }),
};

export type UpdateSettingsInput = Partial<Settings>;
