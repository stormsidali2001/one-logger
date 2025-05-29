import { useQuery } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';
import type { Project } from '../../types/project';
import { apiClient } from '../../lib/api';

export function useProjectById(id: string) {
  return useQuery<Project>({
    queryKey: queryKeys.projects.detail(id),
    queryFn: () => apiClient.getProjectById(id),
    enabled: !!id,
  });
}