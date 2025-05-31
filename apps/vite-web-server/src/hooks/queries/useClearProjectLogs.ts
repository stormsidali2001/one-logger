import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { sdk } from '../../lib/sdk';
import { queryKeys } from './queryKeys';

/**
 * Hook to clear all logs for a specific project
 */
export function useClearProjectLogs() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (projectId: string) => {
      return sdk.projects.clearLogs(projectId);
    },
    onSuccess: (_, projectId) => {
      // Invalidate project logs when cleared
      queryClient.invalidateQueries({ queryKey: queryKeys.logs.byProject(projectId) });
      // Also invalidate project metrics as log counts will change
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.metrics(projectId) });
      // Invalidate historical log counts
      queryClient.invalidateQueries({ queryKey: queryKeys.logs.historicalCounts(projectId,7) });
      
      toast.success("Project logs cleared", {
        description: "All logs for this project have been successfully cleared"
      });
    },
    onError: (error) => {
      console.error('Failed to clear project logs:', error);
      toast.error("Error clearing project logs", {
        description: "Could not clear the project logs"
      });
    }
  });
}