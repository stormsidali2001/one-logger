import { useQuery } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';
import type { Log } from '../../types/log';
import { apiClient } from '../../lib/api';

export function useLogById(id: string) {
  return useQuery<Log>({
    queryKey: queryKeys.logs.detail(id),
    queryFn: () => apiClient.getLogById(id),
    enabled: !!id,
  });
}