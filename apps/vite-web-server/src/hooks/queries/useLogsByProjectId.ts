import { useQuery } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';
import type { Log, PaginationOptions, LogCursor } from '../../types/log';
import { apiClient } from '../../lib/api';

// Helper function to get next cursor from logs data
export function getNextCursor(logs: Log[]): LogCursor | undefined {
  if (!logs || logs.length === 0) return undefined;

  const lastLog = logs[logs.length - 1];
  if (!lastLog || !lastLog.id || !lastLog.timestamp) return undefined;
  
  return {
    id: lastLog.id,
    timestamp: lastLog.timestamp
  };
}

export function useLogsByProjectId(projectId: string, options?: PaginationOptions) {
  const logsQuery = useQuery<{ logs: Log[]; hasNextPage: boolean }>({
    queryKey: [...queryKeys.logs.byProject(projectId), options],
    queryFn: () => apiClient.getLogsByProjectId(projectId, options),
    enabled: !!projectId,
  });

  return {
    ...logsQuery,
    // Add helper for getting the next cursor
    hasNextCursor: logsQuery.data?.hasNextPage || false,
  };
}
