import { useQuery } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';
import { Log } from '../../types/log';

export function useLogById(id: string) {
  return useQuery<Log | undefined>({
    queryKey: queryKeys.logs.getById(id),
    queryFn: () => window.electronAPI.getLogById(id),
    enabled: !!id,
  });
} 