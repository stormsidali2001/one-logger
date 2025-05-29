import { useQuery } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';
import { apiClient } from '../../lib/api';

export function useHistoricalLogCounts(projectId: string, days: number = 30) {
  return useQuery({
    queryKey: queryKeys.logs.historicalCounts(projectId, days),
    queryFn: () => apiClient.getHistoricalLogCounts(projectId, days),
    enabled: !!projectId,
  });
}