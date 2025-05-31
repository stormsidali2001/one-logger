import { useQuery } from '@tanstack/react-query';
import { sdk } from '@/lib/sdk';
import type { Log, LogsOptions, LogCursor } from '@one-logger/server-sdk';
import { queryKeys } from './queryKeys';

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

export function useLogsByProjectId(projectId: string, options?: LogsOptions) {
  const logsQuery = useQuery<{ logs: Log[]; hasNextPage: boolean }>({
    queryKey: queryKeys.logs.byProject(projectId),
    queryFn: () => sdk.projects.getLogs(projectId, options),
    enabled: !!projectId,
  });

  return {
    ...logsQuery,
    // Add helper for getting the next cursor
    hasNextCursor: logsQuery.data?.hasNextPage || false,
  };
}
