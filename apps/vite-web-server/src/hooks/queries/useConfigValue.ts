import { useQuery } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';
import { apiClient } from '../../lib/api';

export function useConfigValue(key: string) {
  return useQuery({
    queryKey: queryKeys.config.value(key),
    queryFn: async () => {
      return await apiClient.getConfig(key);
    },
    enabled: !!key,
  });
}

export function useAllConfigs() {
  return useQuery({
    queryKey: queryKeys.config.all,
    queryFn: async () => {
      return await apiClient.getAllConfigs();
    },
  });
}