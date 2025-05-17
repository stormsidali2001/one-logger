import { useQuery } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';
import { Project } from '../../types/project';

export function useProjectById(id: string) {
  console.log('useProjectById called with id:', id);
  
  return useQuery<Project | undefined>({
    queryKey: queryKeys.projects.getById(id),
    queryFn: async () => {
      console.log('Fetching project with id:', id);
      const result = await window.electronAPI.getProjectById(id);
      console.log('Fetch result:', result);
      return result;
    },
    enabled: !!id,
  });
} 
 