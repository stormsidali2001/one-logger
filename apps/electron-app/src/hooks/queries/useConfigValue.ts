import { useQuery } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';

export function useConfigValue(key: string) {
  return useQuery({
    queryKey: queryKeys.config.get(key),
    queryFn: async () => {
      // @ts-ignore
      return await window.electronAPI.getConfig(key);
    },
    enabled: !!key,
  });
}

export function useAllConfigs() {
  return useQuery({
    queryKey: queryKeys.config.all,
    queryFn: async () => {
      // @ts-ignore
      return await window.electronAPI.getAllConfigs();
    },
  });
} 