import { MCPServerManager } from '../server/mcpServerManager.js';

export class RestartMCPServer {
  private mcpServerManager: MCPServerManager;

  constructor(mcpServerManager: MCPServerManager) {
    this.mcpServerManager = mcpServerManager;
  }

  async execute(): Promise<any> {
    return await this.mcpServerManager.restartServer();
  }
}