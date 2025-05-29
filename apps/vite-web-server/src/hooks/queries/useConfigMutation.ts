import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';
import { toast } from 'sonner';
import { apiClient } from '../../lib/api';

interface ConfigMutationOptions {
  /**
   * Whether to invalidate server logs after setting the config value
   * Useful for server configuration changes that might affect logs
   */
  invalidateServerLogs?: boolean;
}

/**
 * Hook to update configuration values
 */
export function useConfigMutation(options: ConfigMutationOptions = {}) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      return apiClient.setConfig(key, value);
    },
    onSuccess: (_, variables) => {
      // Invalidate the related config query
      queryClient.invalidateQueries({ queryKey: queryKeys.config.value(variables.key) });
      
      // Optionally invalidate server logs when we update server-related configs
      if (options.invalidateServerLogs || variables.key.startsWith('server.')) {
        queryClient.invalidateQueries({ queryKey: queryKeys.server.logs() });
      }
    }
  });
}

/**
 * Hook to restart the server
 */
export function useRestartServerMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      return apiClient.restartServer();
    },
    onSuccess: () => {
      // Invalidate server logs when we restart the server
      queryClient.invalidateQueries({ queryKey: queryKeys.server.logs() });
      
      toast.success("Server restarted", {
        description: "Server has been restarted with the new configuration"
      });
    },
    onError: (error) => {
      toast.error("Failed to restart server", {
        description: error instanceof Error ? error.message : "Unknown error occurred"
      });
    }
  });
}