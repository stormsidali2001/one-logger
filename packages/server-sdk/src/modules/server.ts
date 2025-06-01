import type { HttpClient } from '../client.js';
import type { ServerLogsOptions, ServerLogs } from '@notjustcoders/one-logger-types';

export class ServerModule {
  constructor(private client: HttpClient) {}

  /**
   * Get server logs
   */
  async getLogs(options?: ServerLogsOptions): Promise<ServerLogs> {
    const params: Record<string, any> = {};
    if (options?.type) params.type = options.type;
    
    return this.client.get<ServerLogs>('/api/server/logs', params);
  }

  /**
   * Get MCP server logs
   */
  async getMCPLogs(options?: ServerLogsOptions): Promise<ServerLogs> {
    const params: Record<string, any> = {};
    if (options?.type) params.type = options.type;
    
    return this.client.get<ServerLogs>('/api/server/mcp-logs', params);
  }

  /**
   * Restart server
   */
  async restart(): Promise<{ success: boolean }> {
    return this.client.post<{ success: boolean }>('/api/server/restart');
  }

  /**
   * Restart MCP server
   */
  async restartMCP(): Promise<{ success: boolean }> {
    return this.client.post<{ success: boolean }>('/api/server/mcp/restart');
  }

  /**
   * Clear server logs
   */
  async clearLogs(options?: ServerLogsOptions): Promise<{ success: boolean }> {
    const data: Record<string, any> = {};
    if (options?.type) data.type = options.type;
    
    return this.client.post<{ success: boolean }>('/api/server/logs/clear', data);
  }

  /**
   * Clear MCP server logs
   */
  async clearMCPLogs(options?: ServerLogsOptions): Promise<{ success: boolean }> {
    const data: Record<string, any> = {};
    if (options?.type) data.type = options.type;
    
    return this.client.post<{ success: boolean }>('/api/server/mcp-logs/clear', data);
  }
}