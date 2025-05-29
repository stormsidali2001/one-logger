import { MCPServerManager } from '../server/mcpServerManager.js';

export class ClearMCPServerLogs {
  private mcpServerManager: MCPServerManager;

  constructor(mcpServerManager: MCPServerManager) {
    this.mcpServerManager = mcpServerManager;
  }

  execute(type: 'stdout' | 'stderr' | 'all'): any {
    return this.mcpServerManager.clearLogs(type);
  }
}