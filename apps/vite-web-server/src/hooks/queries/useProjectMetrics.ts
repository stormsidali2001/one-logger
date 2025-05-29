import { useQuery } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';
import { apiClient } from '../../lib/api';

export function useProjectMetrics(id: string) {
  return useQuery({
    queryKey: queryKeys.projects.metrics(id),
    queryFn: () => apiClient.getProjectMetrics(id),
    enabled: !!id,
  });
}