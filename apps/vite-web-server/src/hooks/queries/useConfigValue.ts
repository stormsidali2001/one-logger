import { useQuery } from '@tanstack/react-query';
import { sdk } from '../../lib/sdk';
import { queryKeys } from './queryKeys';

export function useConfigValue(key: string) {
  return useQuery({
    queryKey: queryKeys.config.value(key),
    queryFn: async () => {
      return await sdk.config.get(key);
    },
    enabled: !!key,
  });
}

export function useAllConfigs() {
  return useQuery({
    queryKey: queryKeys.config.all,
    queryFn: async () => {
      return await sdk.config.getAll();
    },
  });
}