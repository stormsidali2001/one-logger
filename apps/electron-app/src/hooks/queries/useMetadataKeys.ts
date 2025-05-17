import { useQuery } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';

/**
 * Hook to fetch unique metadata keys for a project
 */
export function useMetadataKeys(projectId: string) {
  return useQuery({
    queryKey: [...queryKeys.logs.metadataKeys(projectId)],
    queryFn: async () => {
      if (!projectId) return [];
      
      return window.electronAPI.getMetadataKeysByProjectId(projectId);
    },
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
} 