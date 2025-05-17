import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';
import { Log, LogCursor } from '../../types/log';
import { getNextCursor } from './useLogsByProjectId';
import { PaginationOptions } from '../../types/electron';

export function useLogs(options?: PaginationOptions) {
  const queryClient = useQueryClient();

  const logsQuery = useQuery<Log[]>({
    queryKey: [...queryKeys.logs.all, options],
    queryFn: () => window.electronAPI.getAllLogs(options),
  });

  const createLog = useMutation({
    mutationFn: (data: Omit<Log, 'id'>) => window.electronAPI.createLog(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.logs.all });
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