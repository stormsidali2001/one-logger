import { ipcMain } from "electron";
import { MCPServerManager } from "../server/mcpServerManager.js";

export function registerMCPServerHandlers(): void {
  const serverManager = MCPServerManager.getInstance();

  // Handler to restart the server
  ipcMain.handle('mcpServer:restart', async () => {
    return await serverManager.restartServer();
  });
  
  // Handler to stop the server
  ipcMain.handle('mcpServer:stop', async () => {
    return await serverManager.stopServer();
  });
  
  // Handler to get server logs
  ipcMain.handle('mcpServer:getLogs', async (_, type: 'stdout' | 'stderr' | 'all') => {
    return serverManager.getLogs(type);
  });
  
  // Handler to clear server logs
  ipcMain.handle('mcpServer:clearLogs', async (_, type: 'stdout' | 'stderr' | 'all') => {
    return serverManager.clearLogs(type);
  });
} 