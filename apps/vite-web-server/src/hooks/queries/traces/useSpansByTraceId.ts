import { useQuery } from '@tanstack/react-query';
import { sdk } from '@/lib/sdk';
import type { SpanData } from '@one-logger/server-sdk';
import { queryKeys } from '../queryKeys';

export function useSpansByTraceId(traceId: string) {
  return useQuery<SpanData[]>({
    queryKey: queryKeys.spans.byTrace(traceId),
    queryFn: () => sdk.traces.getSpansByTraceId(traceId),
    enabled: !!traceId,
  });
}