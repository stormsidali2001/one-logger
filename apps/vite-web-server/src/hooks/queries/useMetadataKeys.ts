import { useQuery } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';
import { apiClient } from '../../lib/api';

export function useMetadataKeys() {
  return useQuery<string[]>({
    queryKey: queryKeys.metadata.keys(),
    queryFn: () => apiClient.getMetadataKeys(),
  });
}