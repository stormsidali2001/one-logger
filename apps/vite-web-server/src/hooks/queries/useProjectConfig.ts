import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';
import { sdk } from '@/lib/sdk';
import { toast } from 'sonner';
import type { ProjectConfig } from '@one-logger/server-sdk';

export function useProjectConfig(projectId: string) {
  return useQuery<ProjectConfig>({
    queryKey: queryKeys.projects.config(projectId),
    queryFn: () => sdk.projects.getConfig(projectId),
    enabled: !!projectId,
  });
}

export function useUpdateProjectConfig() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ projectId, config }: { projectId: string; config: ProjectConfig }) =>
      sdk.projects.updateConfig(projectId, config),
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