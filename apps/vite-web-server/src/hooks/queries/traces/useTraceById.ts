import { useQuery } from '@tanstack/react-query';
import { sdk } from '@/lib/sdk';
import type { TraceData } from '@notjustcoders/one-logger-server-sdk';
import { queryKeys } from '../queryKeys';

export function useTraceById(id: string) {
  return useQuery<TraceData>({
    queryKey: queryKeys.traces.detail(id),
    queryFn: () => sdk.traces.getById(id),
    enabled: !!id,
  });
}