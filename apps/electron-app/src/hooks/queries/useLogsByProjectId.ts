import { useQuery } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';
import { Log, LogFilters, LogCursor, MetadataFilter } from '../../types/log';
import { PaginationOptions } from '../../types/electron';

// Extend PaginationOptions with the log filtering options
export interface ProjectLogsOptions extends PaginationOptions {
  level?: string | string[];
  messageContains?: string;
  fromDate?: string | Date;
  toDate?: string | Date;
  metaContains?: Record<string, string>;
  metadata?: MetadataFilter[]; // Add support for metadata filters
}

export function useLogsByProjectId(projectId: string, options?: ProjectLogsOptions) {
  return useQuery<Log[]>({
    queryKey: [...queryKeys.logs.getByProjectId(projectId), options],
    queryFn: () => {
      if (!options || Object.keys(options).length === 0) {
        // Use the simple version if no filters are provided
        return window.electronAPI.getLogsByProjectId(projectId);
      } else {
        // Use the filtered version with all options
        const filters: LogFilters = {
          projectId,
          ...options
        };
        return window.electronAPI.getFilteredLogs(filters);
      }
    },
    enabled: !!projectId,
  });
}

/**
 * Helper function to get the cursor for the next page of logs
 * @param logs The current page of logs
 * @returns A cursor object or undefined if there are no logs
 */
export function getNextCursor(logs: Log[]): LogCursor | undefined {
  if (!logs || logs.length === 0) return undefined;
  
  const lastLog = logs[logs.length - 1];
  return {
    id: lastLog.id,
    timestamp: lastLog.timestamp
  };
}

/**
 * Example usage of cursor-based pagination:
 * 
 * // Initial query without a cursor
 * const { data: firstPage } = useLogsByProjectId(projectId, { limit: 20 });
 * 
 * // Get cursor for next page
 * const nextCursor = getNextCursor(firstPage);
 * 
 * // Query with cursor for next page
 * const { data: nextPage } = useLogsByProjectId(projectId, { 
 *   limit: 20,
 *   cursor: nextCursor,
 *   sortDirection: 'desc' // newest first
 * });
 */ 