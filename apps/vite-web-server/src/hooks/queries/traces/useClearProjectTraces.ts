import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { sdk } from '../../../lib/sdk';
import { queryKeys } from '../queryKeys';

/**
 * Hook to clear all traces for a specific project
 */
export function useClearProjectTraces() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (projectId: string) => {
      return sdk.traces.clearByProjectId(projectId);
    },
    onSuccess: (_, projectId) => {
      // Invalidate project traces when cleared
      queryClient.invalidateQueries({ queryKey: queryKeys.traces.byProject(projectId) });
      // Also invalidate project metrics as trace counts will change
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.metrics(projectId) });
      
      toast.success("Project traces cleared", {
        description: "All traces for this project have been successfully cleared"
      });
    },
    onError: (error) => {
      console.error('Failed to clear project traces:', error);
      toast.error("Error clearing project traces", {
        description: "Could not clear the project traces"
      });
    }
  });
}