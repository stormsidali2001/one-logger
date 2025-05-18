import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';
import { toast } from 'sonner';

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
      return window.electron.configSet(key, value);
    },
    onSuccess: (_, variables) => {
      // Invalidate the related config query
      queryClient.invalidateQueries({ queryKey: queryKeys.config.get(variables.key) });
      
      // Optionally invalidate server logs when we update server-related configs
      if (options.invalidateServerLogs || variables.key.startsWith('server.')) {
        queryClient.invalidateQueries({ queryKey: ['server', 'logs'] });
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
      return window.electron.restartServer();
    },
    onSuccess: () => {
      // Invalidate server logs when we restart the server
      queryClient.invalidateQueries({ queryKey: ['server', 'logs'] });
      
      toast.success("Server restarted", {
        description: "Server has been restarted with the new configuration"
      });
    },
    onError: (error) => {
      console.error('Failed to restart server:', error);
      toast.error("Error restarting server", {
        description: "Could not restart the server"
      });
    }
  });
} 