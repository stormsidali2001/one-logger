import { useQuery } from '@tanstack/react-query';
import { sdk } from '@/lib/sdk';
import type { TraceData, TracesOptions } from '@notjustcoders/one-logger-server-sdk';
import { queryKeys } from '../queryKeys';

export function useTracesByProjectId(projectId: string, options?: TracesOptions) {
  const tracesQuery = useQuery<{
    traces: TraceData[];
    hasNextPage: boolean;
}>({
    queryKey: queryKeys.traces.byProjectWithOptions(projectId, options),
    queryFn: () => sdk.traces.getByProjectId(projectId, options),
    enabled: !!projectId,
  });

  return {
    ...tracesQuery,
  };
}