import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sdk } from '../../lib/sdk';
import { queryKeys } from './queryKeys';

type LogType = 'stdout' | 'stderr' | 'all';
type LogsResult = string[] | { stdout: string[], stderr: string[] };

export function useMCPServerLogs(type: LogType = 'all') {
  const queryClient = useQueryClient();
  
  const { data, isLoading, error, refetch } = useQuery<LogsResult>({
    queryKey: queryKeys.server.mcpLogs(type),
    queryFn: () => {
      return sdk.server.getMCPLogs({ type });
    },
    staleTime: 5000, // 5 seconds
  });

  // Mutation to clear logs
  const clearLogsMutation = useMutation({
    mutationFn: (clearType: 'stdout' | 'stderr' | 'all') => {
      return sdk.server.clearMCPLogs({ type: clearType });
    },
    onSuccess: () => {
      // Invalidate all server logs queries when any logs are cleared
      queryClient.invalidateQueries({ queryKey: queryKeys.server.all });
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