import { useQuery } from '@tanstack/react-query';
import { sdk } from '@/lib/sdk';
import type { TraceWithSpans } from '@one-logger/server-sdk';
import { queryKeys } from '../queryKeys';

export function useTraceComplete(id: string) {
  return useQuery<TraceWithSpans>({
    queryKey: queryKeys.traces.complete(id),
    queryFn: () => sdk.traces.getComplete(id),
    enabled: !!id,
  });
}