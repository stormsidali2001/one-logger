import { useQuery } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';
import { Log } from '../../types/log';

export function useLogsByProjectId(projectId: string) {
  return useQuery<Log[]>({
    queryKey: queryKeys.logs.getByProjectId(projectId),
    queryFn: () => window.electronAPI.getLogsByProjectId(projectId),
    enabled: !!projectId,
  });
} 