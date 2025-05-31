import { useQuery } from '@tanstack/react-query';
import { sdk } from '../../lib/sdk';
import { queryKeys } from './queryKeys';

export function useHistoricalLogCounts(projectId: string, days: number = 30) {
  return useQuery({
    queryKey: queryKeys.logs.historicalCounts(projectId, days),
    queryFn: () => sdk.projects.getHistoricalLogCounts(projectId, {days: days}),
    enabled: !!projectId,
  });
}