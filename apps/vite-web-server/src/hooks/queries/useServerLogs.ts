import { useQuery } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';
import { apiClient } from '../../lib/api';

export function useServerLogs() {
  return useQuery({
    queryKey: queryKeys.server.logs(),
    queryFn: () => apiClient.getServerLogs(),
    refetchInterval: 5000, // Refetch every 5 seconds for real-time logs
  });
}