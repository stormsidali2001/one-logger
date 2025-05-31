import { useQuery } from '@tanstack/react-query';
import { sdk } from '@/lib/sdk';
import { queryKeys } from './queryKeys';

export function useProjectMetrics(id: string) {
  return useQuery({
    queryKey: queryKeys.projects.metrics(id),
    queryFn: () => sdk.projects.getMetrics(id),
    enabled: !!id,
  });
}