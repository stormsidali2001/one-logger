import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';
import type {  Log, CreateLogData, PaginationOptions, LogCursor } from '../../types/log';
import { apiClient } from '../../lib/api';

// Helper function to get next cursor from logs data
export function getNextCursor(logs: Log[]): LogCursor | undefined {
  if (!logs || logs.length === 0) return undefined;

  const lastLog = logs[logs.length - 1];
  return {
    id: lastLog.id,
    timestamp: lastLog.createdAt
  };
}

export function useLogs(options?: PaginationOptions) {
  const queryClient = useQueryClient();

  const logsQuery = useQuery<Log[]>({
    queryKey: [...queryKeys.logs.all, options],
    queryFn: () => apiClient.getLogs(options),
  });

  const createLog = useMutation({
    mutationFn: (data: CreateLogData) => apiClient.createLog(data),
    onSuccess: (data: Log) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.logs.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.logs.byProject(data.projectId) });
    },
  });

  return {
    ...logsQuery,
    createLog,
    // Add helper for getting the next cursor
    getNextCursor: () => getNextCursor(logsQuery.data || []),
  };
}
