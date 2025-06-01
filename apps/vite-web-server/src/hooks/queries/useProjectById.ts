import { useQuery } from '@tanstack/react-query';
import { sdk } from '@/lib/sdk';
import type { Project } from '@notjustcoders/one-logger-server-sdk';
import { queryKeys } from './queryKeys';

export function useProjectById(id: string) {
  return useQuery<Project>({
    queryKey: queryKeys.projects.detail(id),
    queryFn: () => sdk.projects.getById(id),
    enabled: !!id,
  });
}