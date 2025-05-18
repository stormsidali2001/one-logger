import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

type LogType = 'stdout' | 'stderr' | 'all';
type LogsResult = string[] | { stdout: string[], stderr: string[] };

export function useMCPServerLogs(type: LogType = 'all') {
  const queryClient = useQueryClient();
  
  const { data, isLoading, error, refetch } = useQuery<LogsResult>({
    queryKey: ['mcpServer', 'logs', type],
    queryFn: async () => {
      return window.electron.getMCPServerLogs(type);
    },
    staleTime: 5000, // 5 seconds
  });

  // Mutation to clear logs
  const clearLogsMutation = useMutation({
    mutationFn: async (clearType: LogType) => {
      return window.electron.clearMCPServerLogs(clearType);
    },
    onSuccess: () => {
      // Invalidate all server logs queries when any logs are cleared
      queryClient.invalidateQueries({ queryKey: ['mcpServer', 'logs'] });
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