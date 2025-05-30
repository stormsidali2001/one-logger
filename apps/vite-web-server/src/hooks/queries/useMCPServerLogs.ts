import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';
import { apiClient } from '../../lib/api';

type LogType = 'stdout' | 'stderr' | 'all';
type LogsResult = string[] | { stdout: string[], stderr: string[] };

export function useMCPServerLogs(type: LogType = 'all') {
  const queryClient = useQueryClient();
  
  const { data, isLoading, error, refetch } = useQuery<LogsResult>({
    queryKey: queryKeys.server.mcpLogs(type),
    queryFn: async () => {
      return apiClient.getMCPServerLogs(type);
    },
    staleTime: 5000, // 5 seconds
  });

  // Mutation to clear logs
  const clearLogsMutation = useMutation({
    mutationFn: async (clearType: LogType) => {
      return apiClient.clearMCPServerLogs(clearType);
    },
    onSuccess: () => {
      // Invalidate all server logs queries when any logs are cleared
      queryClient.invalidateQueries({ queryKey: ['server', 'mcpLogs'] });
    },
  });

  return {
    logs: data,
    isLoading,
    error,
    refetch,
    clearLogs: clearLogsMutation.mutate,
    isClearingLogs: clearLogsMutation.isPending
  };
}