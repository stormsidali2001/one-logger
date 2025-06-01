import { useQuery } from '@tanstack/react-query';
import { sdk } from '@/lib/sdk';
import type { SpanData } from '@notjustcoders/one-logger-server-sdk';
import { queryKeys } from '../queryKeys';

export function useSpanById(id: string) {
  return useQuery<SpanData>({
    queryKey: queryKeys.spans.detail(id),
    queryFn: () => sdk.traces.getSpanById(id),
    enabled: !!id,
  });
}