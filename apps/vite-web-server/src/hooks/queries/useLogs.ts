import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';
import type {  Log, CreateLogData, PaginationOptions } from '../../types/log';
import { apiClient } from '../../lib/api';

// Helper function to get next cursor from logs data
export function getNextCursor(logs: Log[]): string | undefined {
  if (!logs || logs.length === 0) return undefined;
  return logs[logs.length - 1]?.id;
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

/**
 * Example usage of cursor-based pagination:
 * 
 * // Initial query without a cursor
 * const { data: firstPage, getNextCursor } = useLogs({ limit: 20 });
 * 
 * // Get cursor for next page
 * const nextCursor = getNextCursor();
 * 
 * // Query with cursor for next page
 * const { data: nextPage } = useLogs({ 
 *   limit: 20,
 *   cursor: nextCursor,
 *   sortDirection: 'desc' // newest first
 * });
 */