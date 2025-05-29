import { useQuery } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';
import { apiClient } from '../../lib/api';

export function useMCPServerLogs() {
  return useQuery({
    queryKey: queryKeys.server.mcpLogs(),
    queryFn: () => apiClient.getMCPServerLogs(),
    refetchInterval: 5000, // Refetch every 5 seconds for real-time logs
  });
}