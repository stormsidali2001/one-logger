import { useQuery } from '@tanstack/react-query';
import { sdk } from '@/lib/sdk';
import type { Log } from '@one-logger/server-sdk';
import { queryKeys } from './queryKeys';

export function useLogById(id: string) {
  return useQuery<Log>({
    queryKey: queryKeys.logs.detail(id),
    queryFn: () => sdk.logs.getById(id),
    enabled: !!id,
  });
}