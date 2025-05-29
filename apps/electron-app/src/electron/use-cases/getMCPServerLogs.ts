import { MCPServerManager } from '../server/mcpServerManager.js';

export class GetMCPServerLogs {
  private mcpServerManager: MCPServerManager;

  constructor(mcpServerManager: MCPServerManager) {
    this.mcpServerManager = mcpServerManager;
  }

  execute(type: 'stdout' | 'stderr' | 'all'): any {
    return this.mcpServerManager.getLogs(type);
  }
}