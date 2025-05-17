import { useQuery } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';
import { HistoricalLogCount } from '../../types/electron';

/**
 * Hook to fetch historical log counts for trend charts
 * @param projectId Project ID to fetch metrics for
 * @param days Number of days of historical data to fetch (default: 7)
 */
export function useHistoricalLogCounts(projectId: string, days: number = 7) {
  return useQuery<HistoricalLogCount[]>({
    queryKey: [...queryKeys.logs.historical(projectId, days)],
    queryFn: async () => {
      if (!projectId) {
        return [];
      }
      
      return window.electronAPI.getHistoricalLogCounts(projectId, days);
    },
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
} 