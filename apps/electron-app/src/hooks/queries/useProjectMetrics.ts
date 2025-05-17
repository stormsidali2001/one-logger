import { useQuery } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';
import { ProjectMetrics } from '../../types/log';

/**
 * Hook to fetch metrics for a project
 * @param projectId Project ID to fetch metrics for
 */
export function useProjectMetrics(projectId: string) {
  return useQuery<ProjectMetrics>({
    queryKey: [...queryKeys.logs.metrics(projectId)],
    queryFn: async () => {
      if (!projectId) {
        return {
          totalLogs: 0,
          todaysLogs: 0,
          totalErrors: 0,
          todaysErrors: 0
        };
      }
      
      return window.electronAPI.getProjectMetrics(projectId);
    },
    enabled: !!projectId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
} 