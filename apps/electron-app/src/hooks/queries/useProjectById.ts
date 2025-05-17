import { useQuery } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';
import { Project } from '../../types/project';

export function useProjectById(id: string) {
  return useQuery<Project | undefined>({
    queryKey: queryKeys.projects.getById(id),
    queryFn: () => window.electronAPI.getProjectById(id),
    enabled: !!id,
  });
} 
 