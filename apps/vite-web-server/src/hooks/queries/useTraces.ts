import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { sdk } from '@/lib/sdk';
import type { TraceData, TraceCreateData, TraceUpdateData } from '@one-logger/server-sdk';
import { queryKeys } from './queryKeys';

export function useTraces() {
  const queryClient = useQueryClient();

  // Mutation: Create trace
  const createTrace = useMutation({
    mutationFn: (data: TraceCreateData) =>
      sdk.traces.create(data),
    onSuccess: (_, variables) => {
      // Invalidate traces for the project
      queryClient.invalidateQueries({ queryKey: queryKeys.traces.byProject(variables.projectId) });
      
      toast.success('Trace created', {
        description: 'The trace has been successfully created.'
      });
    },
    onError: (error) => {
      console.error('Failed to create trace:', error);
      toast.error('Failed to create trace', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  });

  // Mutation: Bulk create traces
  const bulkCreateTraces = useMutation({
    mutationFn: (traces: TraceCreateData[]) =>
      sdk.traces.bulkCreate(traces),
    onSuccess: (result, variables) => {
      // Invalidate traces for all affected projects
      const projectIds = [...new Set(variables.map(trace => trace.projectId))];
      projectIds.forEach(projectId => {
        queryClient.invalidateQueries({ queryKey: queryKeys.traces.byProject(projectId) });
      });
      
      toast.success('Traces created', {
        description: `${result.count} traces have been successfully created.`
      });
    },
    onError: (error) => {
      console.error('Failed to create traces in bulk:', error);
      toast.error('Failed to create traces', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  });

  // Mutation: Update trace
  const updateTrace = useMutation({
    mutationFn: ({ id, data }: { id: string; data: TraceUpdateData }) =>
      sdk.traces.update(id, data),
    onSuccess: (updatedTrace) => {
      // Invalidate specific trace queries
      queryClient.invalidateQueries({ queryKey: queryKeys.traces.detail(updatedTrace.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.traces.complete(updatedTrace.id) });
      // Invalidate project traces
      queryClient.invalidateQueries({ queryKey: queryKeys.traces.byProject(updatedTrace.projectId) });
      
      toast.success('Trace updated', {
        description: 'The trace has been successfully updated.'
      });
    },
    onError: (error) => {
      console.error('Failed to update trace:', error);
      toast.error('Failed to update trace', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  });

  return {
    createTrace,
    bulkCreateTraces,
    updateTrace,
  };
}