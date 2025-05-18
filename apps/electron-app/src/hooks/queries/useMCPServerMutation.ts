import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

/**
 * Hook to restart the MCP server
 */
export function useRestartMCPServerMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      return window.electron.restartMCPServer();
    },
    onSuccess: () => {
      // Invalidate MCP server logs when we restart the server
      queryClient.invalidateQueries({ queryKey: ['mcpServer', 'logs'] });
      
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