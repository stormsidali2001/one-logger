import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { sdk } from '@/lib/sdk';
import type { SpanCreateData, SpanUpdateData } from '@one-logger/server-sdk';
import { queryKeys } from '../queryKeys';

export function useSpans() {
  const queryClient = useQueryClient();

  // Mutation: Create span
  const createSpan = useMutation({
    mutationFn: (data: SpanCreateData) =>
      sdk.traces.createSpan(data),
    onSuccess: (newSpan) => {
      // Invalidate spans for the trace
      queryClient.invalidateQueries({ queryKey: queryKeys.spans.byTrace(newSpan.traceId) });
      // Invalidate the complete trace as it now has new spans
      queryClient.invalidateQueries({ queryKey: queryKeys.traces.complete(newSpan.traceId) });
      
      toast.success('Span created', {
        description: 'The span has been successfully created.'
      });
    },
    onError: (error) => {
      console.error('Failed to create span:', error);
      toast.error('Failed to create span', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  });

  // Mutation: Update span
  const updateSpan = useMutation({
    mutationFn: ({ id, data }: { id: string; data: SpanUpdateData }) =>
      sdk.traces.updateSpan(id, data),
    onSuccess: (updatedSpan) => {
      // Invalidate specific span queries
      queryClient.invalidateQueries({ queryKey: queryKeys.spans.detail(updatedSpan.id) });
      // Invalidate spans for the trace
      queryClient.invalidateQueries({ queryKey: queryKeys.spans.byTrace(updatedSpan.traceId) });
      // Invalidate the complete trace
      queryClient.invalidateQueries({ queryKey: queryKeys.traces.complete(updatedSpan.traceId) });
      
      toast.success('Span updated', {
        description: 'The span has been successfully updated.'
      });
    },
    onError: (error) => {
      console.error('Failed to update span:', error);
      toast.error('Failed to update span', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  });

  return {
    createSpan,
    updateSpan,
  };
}