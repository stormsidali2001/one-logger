import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from './queryKeys';
import { apiClient } from '../../lib/api';

/**
 * Hook to restart the MCP server
 */
export function useRestartMCPServerMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      return apiClient.restartMCPServer();
    },
    onSuccess: () => {
      // Invalidate MCP server logs when we restart the server
      queryClient.invalidateQueries({ queryKey: queryKeys.server.mcpLogs() });
      
      toast.success("MCP Server restarted", {
        description: "MCP Server has been restarted with the new configuration"
      });
    },
    onError: (error) => {
      console.error('Failed to restart MCP server:', error);
      toast.error("Error restarting MCP server", {
        description: "Could not restart the MCP server"
      });
    }
  });
}