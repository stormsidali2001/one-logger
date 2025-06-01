import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';
import { sdk } from '@/lib/sdk';
import type {  ServerLogsOptions } from '@notjustcoders/one-logger-server-sdk';

type LogsResult = string[] | { stdout: string[], stderr: string[] };

export function useServerLogs(options?: ServerLogsOptions) {
  const queryClient = useQueryClient();
  
  const { data, isLoading, error, refetch } = useQuery<LogsResult>({
    queryKey: queryKeys.server.logs(),
    queryFn: () => sdk.server.getLogs(options),
    refetchInterval: 5000, // Refetch every 5 seconds for real-time logs
  });

  // Mutation to clear logs
  const clearLogsMutation = useMutation({
    mutationFn: (clearType: 'stdout' | 'stderr' | 'all') => {
      return sdk.server.clearLogs({ type: clearType });
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