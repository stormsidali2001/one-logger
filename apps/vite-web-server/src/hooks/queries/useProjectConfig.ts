import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';
import { apiClient } from '../../lib/api';
import { toast } from 'sonner';

export interface ProjectConfig {
  trackedMetadataKeys?: string[];
}

export function useProjectConfig(projectId: string) {
  return useQuery<ProjectConfig>({
    queryKey: queryKeys.projects.config(projectId),
    queryFn: () => apiClient.getProjectConfig(projectId),
    enabled: !!projectId,
  });
}

export function useUpdateProjectConfig() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ projectId, config }: { projectId: string; config: ProjectConfig }) => 
      apiClient.updateProjectConfig(projectId, config),
    onSuccess: (_, variables) => {
      // Invalidate the project config query
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.config(variables.projectId) });
      // Also invalidate the project details to refresh the full project data
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(variables.projectId) });
      
      toast.success('Project configuration updated', {
        description: 'The project configuration has been successfully updated.'
      });
    },
    onError: (error) => {
      console.error('Failed to update project config:', error);
      toast.error('Failed to update project configuration', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  });
}