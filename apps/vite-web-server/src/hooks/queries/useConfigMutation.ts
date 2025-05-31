import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { sdk } from '../../lib/sdk';
import { queryKeys } from './queryKeys';

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
      return sdk.config.set(key, value);
    },
    onSuccess: (_, variables) => {
      // Invalidate the related config query
      queryClient.invalidateQueries({ queryKey: queryKeys.config.value(variables.key) });
      queryClient.invalidateQueries({ queryKey: queryKeys.config.all });
      
      // Optionally invalidate server logs when we update server-related configs
      if (options.invalidateServerLogs || variables.key.startsWith('server.')) {
        queryClient.invalidateQueries({ queryKey: queryKeys.server.all });
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
      return sdk.server.restart();
    },
    onSuccess: () => {
      // Invalidate server logs when we restart the server
      queryClient.invalidateQueries({ queryKey: queryKeys.server.all });
      
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