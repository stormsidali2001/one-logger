import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';
import { Log } from '../../types/log';

export function useLogs() {
  const queryClient = useQueryClient();

  const logsQuery = useQuery<Log[]>({
    queryKey: queryKeys.logs.all,
    queryFn: () => window.electronAPI.getAllLogs(),
  });

  const createLog = useMutation({
    mutationFn: (data: Omit<Log, 'id'>) => window.electronAPI.createLog(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.logs.all });
    },
  });

  return {
    ...logsQuery,
    createLog,
  };
} 