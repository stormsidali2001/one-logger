import { ipcMain } from "electron";
import { MCPServerManager } from "../server/mcpServerManager.js";
import { RestartMCPServer } from '../use-cases/restartMCPServer.js';
import { StopMCPServer } from '../use-cases/stopMCPServer.js';
import { GetMCPServerLogs } from '../use-cases/getMCPServerLogs.js';
import { ClearMCPServerLogs } from '../use-cases/clearMCPServerLogs.js';

export function registerMCPServerHandlers(): void {
  const serverManager = MCPServerManager.getInstance();
  const restartMCPServer = new RestartMCPServer(serverManager);
  const stopMCPServer = new StopMCPServer(serverManager);
  const getMCPServerLogs = new GetMCPServerLogs(serverManager);
  const clearMCPServerLogs = new ClearMCPServerLogs(serverManager);

  // Handler to restart the server
  ipcMain.handle('mcpServer:restart', async () => {
    return await restartMCPServer.execute();
  });

  // Handler to stop the server
  ipcMain.handle('mcpServer:stop', async () => {
    return await stopMCPServer.execute();
  });

  // Handler to get server logs
  ipcMain.handle('mcpServer:getLogs', async (_, type: 'stdout' | 'stderr' | 'all') => {
    return getMCPServerLogs.execute(type);
  });

  // Handler to clear server logs
  ipcMain.handle('mcpServer:clearLogs', async (_, type: 'stdout' | 'stderr' | 'all') => {
    return clearMCPServerLogs.execute(type);
  });
}