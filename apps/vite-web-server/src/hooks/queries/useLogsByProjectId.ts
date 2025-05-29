import { useQuery } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';
import type { Log, PaginationOptions } from '../../types/log';
import { apiClient } from '../../lib/api';
import { getNextCursor } from './useLogs';

export function useLogsByProjectId(projectId: string, options?: PaginationOptions) {
  const logsQuery = useQuery<Log[]>({
    queryKey: [...queryKeys.logs.byProject(projectId), options],
    queryFn: () => apiClient.getLogsByProjectId(projectId, options),
    enabled: !!projectId,
  });

  return {
    ...logsQuery,
    // Add helper for getting the next cursor
    getNextCursor: () => getNextCursor(logsQuery.data || []),
  };
}

export { getNextCursor };